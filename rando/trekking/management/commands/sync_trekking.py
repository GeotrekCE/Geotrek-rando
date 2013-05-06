import re
import shutil
import os
from os.path import join, getmtime, dirname, getsize
from os import makedirs, utime
import errno
import json
import logging
from urlparse import urlparse

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

# Make sure pictograms start with MEDIA_URL
def reroot(item, attr=None):
    if isinstance(item, list):
        return [reroot(i, attr) for i in item]
    if attr is not None:
        item[attr] = reroot(item[attr])
        return item
    return re.sub('(.*)%s' % settings.MEDIA_URL, settings.MEDIA_URL, item or '')


def recursive_copy(root_src_dir, root_dst_dir):
    """Recursively copy a folder into another"""
    for src_dir, dirs, files in os.walk(root_src_dir):
        dst_dir = src_dir.replace(root_src_dir, root_dst_dir)
        if not os.path.exists(dst_dir):
            os.makedirs(dst_dir)
        for file_ in files:
            src_file = os.path.join(src_dir, file_)
            dst_file = os.path.join(dst_dir, file_)
            shutil.copy2(src_file, dst_file)  # preserve stats


class InputFile(object):

    def __init__(self, command, url, language=None):
        self.command = command
        server = settings.CAMINAE_SERVER
        if 'http' not in settings.CAMINAE_SERVER:
            server = 'http://' + settings.CAMINAE_SERVER
        parts = urlparse(server)
        self.rooturl = parts.path
        if len(self.rooturl) <= 1:
            self.rooturl = ''
        url = url.replace(self.rooturl, '')
        self.url = url[1:] if url.startswith('/') else url

        self.absolute_url = join(server, self.url)
        self.language = language or ''
        self.path = join(settings.INPUT_DATA_ROOT, self.language, self.url)
        # All files are downloaded in a separate folder.
        # And copied to INPUT_DATA_ROOT if whole sync is successful.
        self.path_tmp = join(settings.INPUT_TMP_ROOT, self.language, self.url)
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
            cprint('/' + self.language, 'cyan', end='', file=self.command.stdout)
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
        self.command.stdout.flush()
        self.reply = requests.get(self.absolute_url, headers=headers)

        if self.reply.status_code in (304,):
            cprint("%s (Up-to-date)" % self.reply.status_code, 'green', attrs=['bold'], file=self.command.stdout)
            return
        elif self.reply.status_code != requests.codes.ok:
            cprint("%s (Failed)" % self.reply.status_code, 'red', attrs=['bold'], file=self.command.stderr)
            raise IOError("Failed to retrieve %s (code: %s)" % (self.absolute_url, 
                                                                self.reply.status_code))
        else:
            cprint("%s (Download)" % self.reply.status_code, 'yellow', file=self.command.stdout)

        mkdir_p(dirname(self.path_tmp))
        with open(self.path_tmp, 'wb') as f:
            f.write(self.content())
            f.write("\n")
        logger.debug("  %s\n" % self.path.replace(settings.INPUT_DATA_ROOT, ''))

        last_modified = parse_http_date_safe(self.reply.headers.get('last-modified'))
        if last_modified:
            utime(self.path_tmp, (last_modified, last_modified))

    def content(self):
        if not self.reply.content:
            return open(self.path, 'rb').read()
        return self.reply.content


class POIsInputFile(InputFile):

    def content(self):
        content = self.reply.json
        if content is None:
            return super(POIsInputFile, self).content()

        features = []
        for feature in content['features']:
            properties = feature['properties']
            poitype = properties.pop('serializable_type')
            poitype = reroot(poitype, attr='pictogram')
            properties['type'] = poitype
            properties['thumbnail'] = reroot(properties.pop('serializable_thumbnail'))
            properties['pictures'] = reroot(properties.pop('serializable_pictures'), attr='url')
            feature['properties'] = properties
            features.append(feature)
        content['features'] = features
        return json.dumps(content)


class TrekInputFile(InputFile):

    def content(self):
        content = self.reply.json
        if content is None:
            return super(TrekInputFile, self).content()

        content['thumbnail'] = reroot(content['thumbnail'])
        content['pictures'] = reroot(content['pictures'], attr='url')
        content['themes'] = reroot(content['themes'], attr='pictogram')
        content['usages'] = reroot(content['usages'], attr='pictogram')
        wl = []
        for w in content['web_links']:
            w['category'] = reroot(w['category'], attr='pictogram')
            wl.append(w)
        content['web_links'] = wl

        # Remove unpublished treks from related
        content['relationships'] = [r for r in content['relationships'] if r['published']]
        # For presentation purposes
        content['relationships_departure'] = [r for r in content['relationships'] if r['has_common_departure']]
        content['relationships_edge'] = [r for r in content['relationships'] if r['has_common_edge']]
        content['relationships_circuit'] = [r for r in content['relationships'] if r['is_circuit_step']]
        return json.dumps(content)


class TrekListInputFile(InputFile):

    def __init__(self, command, **kwargs):
        super(TrekListInputFile, self).__init__(command, models.Trek.filepath, **kwargs)

    def content(self):
        content = self.reply.json
        if content is None:
            return super(TrekListInputFile, self).content()

        features = []
        for feature in content['features']:
            properties = feature['properties']

            # Ignore treks that are not published
            if not properties.get('published', False):
                logger.debug('Trek %s is not published.' % properties.get('pk', -1))
                continue

            pk = properties['pk']
            # Fill with detail properties
            detailpath = models.Trek.detailpath.format(pk=pk)
            detailfile = TrekInputFile(self.command, detailpath, language=self.language)
            detailfile.pull()
            detail = json.loads(detailfile.content())
            properties.update(detail)

            # Remove rooturl from relative URLs
            for k in ['altimetric_profile', 'gpx', 'kml', 'map_image_url', 'printable']:
                properties[k] = properties[k].replace(self.rooturl, '') if properties[k] else properties[k]

            # Add POIs information in list, useful for textual search
            f = POIsInputFile(self.command, models.POIs.filepath.format(trek__pk=pk),
                              language=self.language)
            f.pull()
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
        cprint('Caminae server: %s' % settings.CAMINAE_SERVER, 'blue', file=self.stdout)

        try:
            InputFile(self, models.Settings.filepath).pull_if_modified()
            app_settings = models.Settings.objects.all()
            languages = app_settings.languages.available.keys()
            logger.debug("Languages: %s" % languages)
            for language in languages:
                TrekListInputFile(self, language=language).pull()

                for trek in models.Trek.tmp_objects.filter(language=language).all():
                    InputFile(self, trek.properties.altimetric_profile, language=language).pull_if_modified()
                    InputFile(self, trek.properties.gpx, language=language).pull_if_modified()
                    InputFile(self, trek.properties.kml, language=language).pull_if_modified()
                    InputFile(self, trek.properties.map_image_url, language=language).pull_if_modified()
                    InputFile(self, trek.properties.printable, language=language).pull_if_modified()

            # Fetch media only once, since they do not depend on language
            for trek in models.Trek.tmp_objects.filter(language=settings.LANGUAGE_CODE).all():
                if trek.properties.thumbnail:
                    InputFile(self, trek.properties.thumbnail).pull_if_modified()
                for picture in trek.properties.pictures:
                    InputFile(self, picture.url).pull_if_modified()

                for theme in trek.properties.themes:
                    InputFile(self, theme.pictogram).pull_if_modified()
                for usage in trek.properties.usages:
                    InputFile(self, usage.pictogram).pull_if_modified()
                for weblink in trek.properties.web_links:
                    if weblink.category:
                        InputFile(self, weblink.category.pictogram).pull_if_modified()
                for poi in models.POIs.tmp_objects.filter(trek__pk=trek.pk,
                                                          language=settings.LANGUAGE_CODE).all():
                    if poi.properties.thumbnail:
                        InputFile(self, poi.properties.thumbnail).pull_if_modified()
                    for picture in poi.properties.pictures:
                        InputFile(self, picture.url).pull_if_modified()
                    InputFile(self, poi.properties.type.pictogram).pull_if_modified()

            # Move downloaded tmp data to INPUT_DATA_ROOT
            recursive_copy(settings.INPUT_TMP_ROOT, settings.INPUT_DATA_ROOT)

            # Done !
            cprint("Done.", 'green', attrs=['bold'], file=self.stdout)

        except IOError, e:
            logger.fatal(e)
            cprint("Failed!", 'red', attrs=['bold'], file=self.stdout)

        finally:
            # Clean-up temp files
            if os.path.exists(settings.INPUT_TMP_ROOT):
                shutil.rmtree(settings.INPUT_TMP_ROOT)
