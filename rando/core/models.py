import os
import json
import datetime

from easydict import EasyDict as edict
from django.conf import settings

from rando import logger
from rando.core import classproperty


class JSONManager(object):
    def __init__(self, klass=object, filepath='', language=None, use_tmp=False):
        self.klass = klass
        self.filepath = filepath
        self.language = language
        self.use_tmp = use_tmp

    def filter(self, **kwargs):
        self.__dict__.update(**kwargs)
        return self

    @property
    def fullpath(self):
        self.filepath = self.filepath.format(**self.__dict__)
        base_path = settings.INPUT_DATA_ROOT if not self.use_tmp else settings.INPUT_TMP_ROOT
        return os.path.join(base_path, self.language or '', self.filepath)

    @property
    def content(self):
        try:
            logger.debug("Read content from %s" % self.fullpath)
            with open(self.fullpath, 'r') as f:
                content = f.read()
            return content
        except IOError:
            logger.error("Could not read '%s'" % self.fullpath)
        return '[]'

    def all(self):
        """
        Instanciate objects on the fly
        We use edict() in order to recursively transform dicts into attributes.
        (ex.: object['properties']['districts'][0]['pk'] becomes
              object.properties.districts[0].pk)
        """
        objects = self._read_content()
        if isinstance(objects, (list, tuple)):
            return [self.klass(objects=self, **edict(o)) for o in objects]
        assert isinstance(objects, dict)
        return self.klass(objects=self, **edict(objects))

    def _read_content(self):
        return json.loads(self.content)


class GeoJSONManager(JSONManager):
    def _read_content(self):
        geojson = super(GeoJSONManager, self)._read_content()
        return geojson.get('features', []) if len(geojson) > 0 else []


class JSONModel(object):
    filepath = None
    manager_class = JSONManager

    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)

    @property
    def last_modified(self):
        t = os.path.getmtime(self.objects.fullpath)
        return datetime.datetime.fromtimestamp(t)

    @classproperty
    def objects(cls):
        return cls.manager_class(cls, cls.filepath)

    @classproperty
    def tmp_objects(cls):
        return cls.manager_class(cls, cls.filepath, use_tmp=True)

    _default_manager = objects


class GeoJSONModel(JSONModel):
    manager_class = GeoJSONManager

    def __getattr__(self, name):
        if name in self.properties:
            return self.properties[name]
        return super(GeoJSONModel, self).__getattribute__(name)

    @property
    def geojson(self):
        return json.dumps({
          "type": "Feature",
          "geometry": { "type": self.geometry.type,
              "coordinates": self.geometry.coordinates
           },
           "properties": self.properties,
        })


class Settings(JSONModel):
    filepath = 'api/settings.json'


class AttachmentFile(JSONModel):
    filepath = 'api/{objectname}/{object__pk}/attachments.json'


class PublishedModel(GeoJSONModel):

    @property
    def short_description(self):
        """The short_description property."""
        return self.description[:100] + '...'

    @property
    def attachments(self):
        return AttachmentFile.objects.filter(objectname=self.__class__.__name__.lower(),
                                             object__pk=self.pk,
                                             language=self.objects.language)

    @property
    def main_image(self):
        try:
            first = self.properties.pictures[0]
            return first['url']
        except IndexError:
            return None
