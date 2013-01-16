from os.path import join, getmtime, dirname, getsize
from os import makedirs, utime
import errno
import requests
import json
import logging

from django.core.management.base import BaseCommand, CommandError
from django.utils.http import http_date, parse_http_date_safe
from django.conf import settings
from django.template.defaultfilters import slugify


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
        self.url = url
        self.absolute_url = 'http://' + join(settings.CAMINAE_SERVER, url)
        self.language = language or settings.LANGUAGE_CODE
        self.path = join(settings.INPUT_DATA_ROOT, self.language, url)

    def pull_if_modified(self):
        self.pull(ifmodified=True)

    def pull(self, ifmodified=False):
        """
        Pull a file served by a Caminae server.

        Set 'if-modified-since' HTTP request header to reduce bandwidth.
        """
        headers = {}
        if self.language:
            headers.update({'Accept-language' : self.language})
        if ifmodified:
            try:
                mtime = getmtime(self.path)
                headers.update({'if-modified-since': http_date(mtime)})
                # If local file is empty, force retrieval
                assert getsize(self.path) > MIN_BYTE_SYZE
            except (OSError, AssertionError):
                pass
        self.command.stdout.write('Sync %s ... ' % self.absolute_url)
        self.reply = requests.get(self.absolute_url, headers=headers)
        self.command.stdout.write(str(self.reply.status_code))

        if self.reply.status_code in (304,):
            self.command.stdout.write(": Up-to-date\n")
            return

        if self.reply.status_code != requests.codes.ok:
            raise IOError("Failed to retrieve %s (code: %s)" % (self.absolute_url, 
                                                                self.reply.status_code))

        mkdir_p(dirname(self.path))
        with open(self.path, 'wb') as f:
            f.write(self.content())
            f.write("\n")
        self.command.stdout.write(": %s\n" % self.path)

        last_modified = parse_http_date_safe(self.reply.headers.get('last-modified'))
        if last_modified:
            utime(self.path, (last_modified, last_modified))

    def content(self):
        return self.reply.content


class TrekInputFile(InputFile):

    def __init__(self, command, **kwargs):
        super(TrekInputFile, self).__init__(command, models.Trek.filepath, **kwargs)

    def content(self):
        content = self.reply.json
        features = []
        for feature in content['features']:
            properties = feature['properties']
            pk = properties['pk']

            # Remove serializable_ in properties names
            for key in properties.keys():
                if 'serializable_' in key:
                    properties[key.replace('serializable_', '')] = properties[key]
                    properties.pop(key)

            # Detail properties
            detailpath = models.Trek.detailpath.format(pk=pk)
            detailfile = InputFile(self.command, detailpath)
            detailfile.pull_if_modified()
            detail = json.loads(detailfile.content())
            properties.update(detail)

            # Add POIs information, useful for textual search
            f = InputFile(self.command, models.POIs.filepath.format(trek__pk=pk),
                          language=self.language)
            f.pull_if_modified()
            poiscontent = json.loads(f.content())
            poisprops = [poi['properties'] for poi in poiscontent['features']]
            properties['pois'] = [{'name': poiprop['name'],
                                   'description': poiprop['description'],
                                   'type': poiprop['serializable_type']['label']}
                                  for poiprop in poisprops]

            properties['slug'] = '%s-%s' % (pk,
                                            slugify(properties['name']))
            if properties.get('published'):
                feature['properties'] = properties
                features.append(feature)
        content['features'] = features
        return json.dumps(content)


class Command(BaseCommand):

    help = 'Synchronize data from a Caminae server'

    def handle(self, *args, **options):
        try:
            InputFile(self, models.District.filepath).pull_if_modified()
            InputFile(self, models.Settings.filepath).pull_if_modified()
            settings = models.Settings.objects.all()
            languages = settings.languages.available.keys()
            logger.info("Languages: %s" % languages)
            for language in languages:
                TrekInputFile(self, language=language).pull()

                for trek in models.Trek.objects.all():
                    InputFile(self, trek.altimetric_url, language=language).pull_if_modified()
                    InputFile(self, trek.gpx_url, language=language).pull_if_modified()
                    InputFile(self, trek.kml_url, language=language).pull_if_modified()

                    #TODO: attached files / pictures
                    #TODO: PDF both layouts
        except IOError, e:
            logger.fatal(e)
