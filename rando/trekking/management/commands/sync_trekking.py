from os.path import join, getmtime, dirname
from os import makedirs, utime
import errno
import requests
import json

from django.core.management.base import BaseCommand, CommandError
from django.utils.http import http_date, parse_http_date_safe
from django.conf import settings


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


def pull_if_modified(command, url):
    """
    Pull a file served by a Caminae server.

    Set 'if-modified-since' HTTP request header to reduce bandwidth.
    """

    absolute_url = 'http://' + join(settings.CAMINAE_SERVER, url)
    path = join(settings.INPUT_DATA_ROOT, url)

    try:
        mtime = getmtime(path)
        headers = {'if-modified-since': http_date(mtime)}
    except OSError:
        headers = {}

    command.stdout.write('Sync %s ... ' % absolute_url)
    r = requests.get(absolute_url, headers=headers)
    command.stdout.write(str(r.status_code) + '\n')

    if r.status_code != requests.codes.ok:
        return

    mkdir_p(dirname(path))
    with open(path, 'wb') as f:
        f.write(r.content)

    last_modified = parse_http_date_safe(r.headers.get('last-modified'))
    if last_modified:
        utime(path, (last_modified, last_modified))


class Command(BaseCommand):

    help = 'Synchronize data from a Caminae server'

    def handle(self, *args, **options):

        pull_if_modified(self, 'api/trek/trek.geojson')
