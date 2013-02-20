from os.path import join, getmtime, dirname, getsize
from os import makedirs, utime
import errno
import json
import logging

from django.core.management.base import BaseCommand
from django.utils.http import http_date, parse_http_date_safe
from django.conf import settings

import requests
from termcolor import cprint

from rando.trekking import models


logger = logging.getLogger(__name__)


MIN_BYTE_SYZE = 10


def mkdir_p(path):
    """
    Create recursively a directory like mkdir -p would do.
    """
    try:
        makedirs(path)
    except OSError, e:
        if e.errno == errno.EEXIST:
            pass
        else:
            raise


class InputFile(object):

    def __init__(self, command, url, language=None):
        self.command = command
        self.url = url[1:] if url.startswith('/') else url
        self.absolute_url = 'http://' + join(settings.CAMINAE_SERVER, self.url)
        self.language = language or settings.LANGUAGE_CODE
        self.path = join(settings.INPUT_DATA_ROOT, self.language, self.url)
        self.reply = None

    def pull_if_modified(self):
        self.pull(ifmodified=True)

    def pull(self, ifmodified=False):
        """
        Pull a file served by a Caminae server.

        Set 'if-modified-since' HTTP request header to reduce bandwidth.
        """
        headers = {}
        if self.language:
            cprint(self.language, 'cyan', end=' ', file=self.command.stdout)
            headers.update({'Accept-language' : self.language})
        if ifmodified:
            try:
                mtime = getmtime(self.path)
                headers.update({'if-modified-since': http_date(mtime)})
                # If local file is empty, force retrieval
                assert getsize(self.path) > MIN_BYTE_SYZE
            except (OSError, AssertionError):
                pass
        cprint('/%s ...' % self.url, 'white', attrs=['bold'], end=' ', file=self.command.stdout)
        self.reply = requests.get(self.absolute_url, headers=headers)

        if self.reply.status_code in (304,):
            cprint("%s (Up-to-date)\n" % self.reply.status_code, 'green', attrs=['bold'], file=self.command.stdout)
            return
        elif self.reply.status_code != requests.codes.ok:
            cprint("%s (Failed)" % self.reply.status_code, 'red', attrs=['bold'], file=self.command.stderr)
            raise IOError("Failed to retrieve %s (code: %s)" % (self.absolute_url, 
                                                                self.reply.status_code))
        else:
            cprint("%s (Download)" % self.reply.status_code, 'yellow', file=self.command.stdout)

        mkdir_p(dirname(self.path))
        with open(self.path, 'wb') as f:
            f.write(self.content())
            f.write("\n")
        self.command.stdout.write("  %s\n" % self.path.replace(settings.INPUT_DATA_ROOT, ''))

        last_modified = parse_http_date_safe(self.reply.headers.get('last-modified'))
        if last_modified:
            utime(self.path, (last_modified, last_modified))

    def content(self):
        return self.reply.content


class POIsInputFile(InputFile):

    def content(self):
        content = self.reply.json
        features = []
        for feature in content['features']:
            properties = feature['properties']
            poitype = properties.pop('serializable_type')
            properties['type'] = poitype
            feature['properties'] = properties
            features.append(feature)
        content['features'] = features
        return json.dumps(content)


class TrekInputFile(InputFile):

    def __init__(self, command, **kwargs):
        super(TrekInputFile, self).__init__(command, models.Trek.filepath, **kwargs)

    def content(self):
        content = self.reply.json
        features = []
        for feature in content['features']:
            properties = feature['properties']

            # Ignore treks that are not published
            if not properties.get('published', False):
                continue

            pk = properties['pk']
            # Fill with detail properties
            detailpath = models.Trek.detailpath.format(pk=pk)
            detailfile = InputFile(self.command, detailpath)
            detailfile.pull_if_modified()
            detail = json.loads(detailfile.content())
            properties.update(detail)

            # Add POIs information, useful for textual search
            f = POIsInputFile(self.command, models.POIs.filepath.format(trek__pk=pk),
                              language=self.language)
            f.pull_if_modified()
            poiscontent = json.loads(f.content())
            poisprops = [poi['properties'] for poi in poiscontent['features']]
            properties['pois'] = [{'name': poiprop['name'],
                                   'description': poiprop['description'],
                                   'type': poiprop['type']['label']}
                                  for poiprop in poisprops]
            feature['properties'] = properties
            features.append(feature)

        content['features'] = features
        return json.dumps(content)


class Command(BaseCommand):

    help = 'Synchronize data from a Caminae server'

    def handle(self, *args, **options):
        try:
            InputFile(self, models.Settings.filepath).pull_if_modified()
            app_settings = models.Settings.objects.all()
            languages = app_settings.languages.available.keys()
            logger.info("Languages: %s" % languages)
            for language in languages:
                TrekInputFile(self, language=language).pull()

                for trek in models.Trek.objects.all():
                    if trek.properties.thumbnail:
                        InputFile(self, trek.properties.thumbnail).pull_if_modified()
                    for picture in trek.properties.pictures:
                        InputFile(self, picture.url).pull_if_modified()

                    for theme in trek.properties.themes:
                        InputFile(self, theme.pictogram).pull_if_modified()
                    for usage in trek.properties.usages:
                        InputFile(self, usage.pictogram).pull_if_modified()
                    for weblink in trek.properties.web_links:
                        InputFile(self, weblink.category.pictogram).pull_if_modified()
                    for poi in trek.pois.all():
                        InputFile(self, poi.properties.type.pictogram).pull_if_modified()

                    InputFile(self, trek.altimetric_url, language=language).pull_if_modified()
                    InputFile(self, trek.gpx_url, language=language).pull_if_modified()
                    InputFile(self, trek.kml_url, language=language).pull_if_modified()
                    #TODO: PDF both layouts

        except IOError, e:
            logger.fatal(e)
