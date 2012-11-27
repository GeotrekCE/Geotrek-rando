from os.path import join, getmtime, dirname
from os import makedirs, utime
import errno
import requests
import json

from django.core.management.base import BaseCommand, CommandError
from django.utils.http import http_date, parse_http_date_safe
from django.conf import settings
from django.template.defaultfilters import slugify

def mkdir_p(path):
    """
    Create recursively a directory like mkdir -p would do.
    """

    try:
        makedirs(path)
    except OSError as e:
        if e.errno == errno.EEXIST:
            pass
        else:
            raise


class InputFile(object):

    def __init__(self, command, url):

        self.command = command
        self.url = url
        self.absolute_url = 'http://' + join(settings.CAMINAE_SERVER, url)
        self.path = join(settings.INPUT_DATA_ROOT, url)

    def pull_if_modified(self):
        """
        Pull a file served by a Caminae server.

        Set 'if-modified-since' HTTP request header to reduce bandwidth.
        """

        try:
            mtime = getmtime(self.path)
            headers = {'if-modified-since': http_date(mtime)}
        except OSError:
            headers = {}

        self.command.stdout.write('Sync %s ... ' % self.absolute_url)
        self.reply = requests.get(self.absolute_url, headers=headers)
        self.command.stdout.write(str(self.reply.status_code) + '\n')

        if self.reply.status_code != requests.codes.ok:
            return

        mkdir_p(dirname(self.path))
        with open(self.path, 'wb') as f:
            f.write(self.content())

        last_modified = parse_http_date_safe(self.reply.headers.get('last-modified'))
        if last_modified:
            utime(self.path, (last_modified, last_modified))

    def content(self):

        return self.content


class GeoJsonInputFile(InputFile):

    def __init__(self, command):

        return super(GeoJsonInputFile, self).__init__(command, 'api/trek/trek.geojson')


    def content(self):

        content = self.reply.json['features']

        for feature in content:
            feature['properties']['slug'] = slugify(feature['properties']['name'])

        return json.dumps(content)


class Command(BaseCommand):

    help = 'Synchronize data from a Caminae server'

    def handle(self, *args, **options):

        input_file = GeoJsonInputFile(self)
        input_file.pull_if_modified()
