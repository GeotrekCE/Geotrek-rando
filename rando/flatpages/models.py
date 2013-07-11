import os
import datetime
import re

from django.conf import settings
from django.db import models
from django.template.defaultfilters import slugify

from rando import classproperty


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

    def all(self):
        path = os.path.join(self.basepath, self.language)
        dirlist = []
        if os.path.exists(path):
            dirlist = os.listdir(unicode(path))  # Give a path in unicode: you get list of unicode filenames
        i = 0
        for fname in dirlist:
            fullpath = os.path.join(path, fname)
            with open(fullpath, 'r') as f:
                content = f.read()
            basename = os.path.splitext(fname)[0]
            m = re.search(r'^(\d+)-(.+)', basename)
            if m:
                pk = int(m.group(1))
                title = m.group(2)
            else:
                title = basename
                pk = i
            i += 1
            # Filter by pk (see redirect view
            if self.pk is None or int(self.pk) == pk:
                yield self.klass(pk, title, content, fullpath)


class FlatPage(object):
    def __init__(self, pk, title, content, fullpath):
        self.pk = pk
        self.title = title
        self.content = content
        self.fullpath = fullpath

    @property
    def last_modified(self):
        t = os.path.getmtime(self.fullpath)
        return datetime.datetime.fromtimestamp(t)

    def slug(self):
        return slugify(self.title)

    @models.permalink
    def get_absolute_url(self):
        return ('flatpages:redirect', (self.pk,))

    @classproperty
    def objects(cls):
        return FlatPageManager(cls)

    _default_manager = objects
