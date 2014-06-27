import re
import shutil
import sys
import os
from os.path import join, getmtime, dirname, getsize
from os import makedirs, utime
import errno

from django.core.management.base import BaseCommand
from django.utils.http import http_date, parse_http_date_safe
from django.conf import settings
from django.core.mail import mail_admins
from django.core.cache import cache

import requests
from termcolor import cprint

from rando import logger
from rando.core.helpers import GeotrekClient
from rando.core.models import Settings
from rando.core.signals import pre_sync, post_sync


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


def reroot(item, attr=None):
    """
    In case the Geotrek admin serves the application on a subfolder (e.g. /geotrek),
    all pictogram and related URLs with start with a prefix.
    This makes sure everything is re-rooted with `MEDIA_URL`.
    """
    if isinstance(item, list):
        return [reroot(i, attr) for i in item]
    if attr is not None:
        value = item.get(attr)
        if value is not None:
            item[attr] = reroot(value)
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

    def __init__(self, url, language=None, client=None, stdout=None, stderr=None):
        url = url[1:] if url.startswith('/') else url
        self.url = url

        self.language = language or ''
        self.client = client or requests  # self.client.get() will work
        self.stdout = stdout or sys.stdout
        self.stderr = stderr or sys.stderr

        self.path = join(settings.INPUT_DATA_ROOT, self.language, self.url)
        # All files are downloaded in a separate folder.
        # And copied to INPUT_DATA_ROOT if whole sync is successful.
        self.path_tmp = join(settings.INPUT_TMP_ROOT, self.language, self.url)
        self.reply = None

    def pull_if_modified(self):
        self.pull(ifmodified=True)

    def pull(self, ifmodified=False):
        """
        Pull a file served by a Geotrek server.

        Set 'if-modified-since' HTTP request header to reduce bandwidth.
        """
        headers = {}
        if self.language:
            cprint('/' + self.language, 'cyan', end='', file=self.stdout)
            headers.update({'Accept-language': self.language})

        if ifmodified:
            try:
                # If local file is empty, force retrieval
                assert getsize(self.path) > settings.MIN_BYTE_SYZE
                # Use datetime of previous file to set header
                mtime = getmtime(self.path)
                headers.update({'if-modified-since': http_date(mtime)})
            except (OSError, AssertionError):
                pass
        cprint('/%s ...' % self.url, 'white', attrs=['bold'], end=' ', file=self.stdout)
        self.stdout.flush()
        self.reply = self.client.get(self.url, headers=headers)

        if self.reply.status_code in (304,):
            cprint("%s (Up-to-date)" % self.reply.status_code, 'green', attrs=['bold'], file=self.stdout)
            return
        elif self.reply.status_code != requests.codes.ok:
            cprint("%s (Failed)" % self.reply.status_code, 'red', attrs=['bold'], file=self.stderr)
            raise IOError("Failed to retrieve %s (code: %s)" % (self.reply.url,
                                                                self.reply.status_code))
        else:
            cprint("%s (Download)" % self.reply.status_code, 'yellow', file=self.stdout)

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


class SyncSession(object):
    def __init__(self, command):
        self.stdout = command.stdout
        self.stderr = command.stderr
        self.client = GeotrekClient()

    def sync(self):

        inputkw = dict(client=self.client,
                       stdout=self.stdout,
                       stderr=self.stderr)

        try:
            cprint('Geotrek server login: %s' % settings.GEOTREK_SERVER, 'blue', file=self.stdout)
            self.client.login()

            InputFile(Settings.filepath, **inputkw).pull_if_modified()
            server_settings = Settings.tmp_objects.all()

            pre_sync.send(sender=self, client=self.client,
                                       server_settings=server_settings,
                                       input_kwargs=inputkw)

            # Move downloaded tmp data to INPUT_DATA_ROOT
            cprint("Copy from temporary %s to production %s" % (settings.INPUT_TMP_ROOT, settings.INPUT_DATA_ROOT), file=self.stdout)
            recursive_copy(settings.INPUT_TMP_ROOT, settings.INPUT_DATA_ROOT)

            cprint("Empty frontend cache")
            cache.clear()

            # Done !
            cprint("Done.", 'green', attrs=['bold'], file=self.stdout)

            post_sync.send(sender=self, client=self.client,
                           settings=server_settings)

        except (AssertionError, IOError) as e:
            logger.fatal(e)
            cprint("Failed!", 'red', attrs=['bold'], file=self.stdout)
            # Send email to admins (silent if not configured)
            mail_admins("[Geotrek] Synchronization failed", repr(e), fail_silently=True)

        finally:
            # Clean-up temp files
            if os.path.exists(settings.INPUT_TMP_ROOT):
                shutil.rmtree(settings.INPUT_TMP_ROOT)


class Command(BaseCommand):

    help = 'Synchronize data from a Geotrek server'

    def handle(self, *args, **options):
        self.stdout.ending = None
        self.stderr.ending = None
        syncsession = SyncSession(self)
        syncsession.sync()
