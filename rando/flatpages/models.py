import os
import datetime
import re

from django.conf import settings
from django.db import models
from django.template.defaultfilters import slugify

from rando.core import classproperty


class FlatPageManager(object):
    def __init__(self, klass, *args, **kwargs):
        self.klass = klass
        self.basepath = settings.FLATPAGES_ROOT
        self.language = settings.LANGUAGE_CODE
        self.pk = None

    def filter(self, **kwargs):
        self.__dict__.update(**kwargs)
        return self

    def get(self, **kwargs):
        slug = kwargs['slug']
        try:
            available = [fp for fp in self.all() if fp.slug() == slug]
            return available[0]
        except IndexError:
            raise Exception("%s does not exist" % (kwargs))

    @staticmethod
    def parse_filename(filename, default_pk):
        """
        >>> FlatPageManager.parse_filename('001-title.html', 2)
        (1, 'title')
        >>> FlatPageManager.parse_filename('title.html', 2)
        (2, 'title')
        >>> FlatPageManager.parse_filename('001.html', 2)
        (2, '001')
        """
        basename = os.path.splitext(filename)[0]
        m = re.search(r'^(\d+)-(.+)', basename)
        if m:
            pk = int(m.group(1))
            title = m.group(2)
        else:
            pk = default_pk
            title = basename
        # Use title overidden in settings, if present.
        title = settings.FLATPAGES_TITLES.get(title, title)
        return (pk, title)

    @staticmethod
    def _filter_reserved_names(dirlist):
        reserved = [settings.POPUP_FILENAME,
                    settings.FOOTER_FILENAME]
        return [f for f in dirlist if f not in reserved]

    def all(self):
        path = os.path.join(self.basepath, self.language)
        dirlist = []
        if os.path.exists(path):
            dirlist = os.listdir(path)

        dirlist = self._filter_reserved_names(dirlist)

        for i, filename in enumerate(sorted(dirlist)):
            if isinstance(filename, str):
                filename = filename.decode('utf-8')
            # Extract pk and title from filename
            pk, title = self.parse_filename(filename, i)
            fullpath = os.path.join(path, filename)
            with open(fullpath, 'r') as f:
                content = f.read()
            # Filter by pk (see redirect view)
            if self.pk is None or int(self.pk) == pk:
                yield self.klass(pk, title, content, fullpath)


class FlatPage(object):
    def __init__(self, pk=None, title=None, content=None, fullpath=None):
        self.pk = pk
        self.title = title
        self.content = content
        self.fullpath = fullpath

    @property
    def last_modified(self):
        t = os.path.getmtime(self.fullpath)
        return datetime.datetime.fromtimestamp(t)

    @property
    def target(self):
        return settings.FLATPAGES_TARGETS.get(self.title, 'all')

    def slug(self):
        return slugify(self.title)

    @models.permalink
    def get_absolute_url(self):
        return ('flatpages:redirect', (self.pk,))

    @classproperty
    def objects(cls):
        return FlatPageManager(cls)

    _default_manager = objects
