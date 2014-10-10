import os
import datetime
import json
import re
import mimetypes

from BeautifulSoup import BeautifulSoup
from django.conf import settings
from django.core.urlresolvers import reverse
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
            available = [fp for fp in self.all() if fp.slug == slug]
            return available[0]
        except IndexError:
            raise Exception("%s does not exist" % (kwargs))

    @staticmethod
    def parse_filename(filename, default_pk):
        basename = os.path.splitext(filename)[0]
        m = re.search(r'^(\d+)-(.+)', basename)
        if m:
            pk = int(m.group(1))
            slug = m.group(2)
        else:
            pk = default_pk
            slug = basename
        return (pk, slug)

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
                yield self.klass(pk,
                                 title=title,
                                 content=content,
                                 fullpath=fullpath,
                                 slug=slugify(title))

    @property
    def json(self):
        """
        Returns a JSON to describe all flat pages.
        """
        results = []
        for page in self.all():
            result = {
                'title': page.title,
                'slug': page.slug,
                'last_modified': page.last_modified.isoformat(),
                'target': page.target,
                'content': page.content,
                'media': page.parse_media(),
                'url': reverse('flatpages:page', kwargs={'slug': page.slug})
            }
            results.append(result)

        return json.dumps(results)


class FlatPage(object):
    def __init__(self, pk=None, title=None, content=None, fullpath=None, slug=None):
        self.pk = pk
        self._title = title or (slug and slug.capitalize())
        self.slug = slug or slugify(title)
        self.content = content
        self.fullpath = fullpath

        # Search for static pages links
        self.link = ''
        if self.content and self.content.lower().find('http') == 0:
            self.link = self.content

    @property
    def last_modified(self):
        t = os.path.getmtime(self.fullpath)
        return datetime.datetime.fromtimestamp(t)

    @property
    def target(self):
        return settings.FLATPAGES_TARGETS.get(self.slug, 'all')

    @property
    def title(self):
        return settings.FLATPAGES_TITLES.get(self.slug, self._title)

    def parse_media(self):
        soup = BeautifulSoup(self.content or '')
        images = soup.findAll('img')
        results = []
        for image in images:
            url = image.get('src')
            if url is None:
                continue

            mt = mimetypes.guess_type(url, strict=True)[0]
            if mt is None:
                mt = 'application/octet-stream'

            results.append({
                'url': url,
                'title': image.get('title', ''),
                'alt': image.get('alt', ''),
                'mimetype': mt.split('/'),
            })

        return results

    @models.permalink
    def get_absolute_url(self):
        return ('flatpages:redirect', (self.pk,))

    @classproperty
    def objects(cls):
        return FlatPageManager(cls)

    _default_manager = objects
