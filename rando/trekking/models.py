import os
import datetime
import logging
import json

from easydict import EasyDict as edict
from django.conf import settings
from django.db import models
from django.utils.translation import get_language, ugettext_lazy as _

from rando import classproperty


logger = logging.getLogger(__name__)


class JSONManager(object):
    def __init__(self, klass, filepath=None, language=None):
        self.klass = klass
        self.filepath = filepath
        self.language = language

    def filter(self, **kwargs):
        self.__dict__.update(**kwargs)
        return self

    @property
    def fullpath(self):
        self.filepath = self.filepath.format(**self.__dict__)
        return os.path.join(settings.INPUT_DATA_ROOT, 
                            self.language or '', self.filepath)

    @property
    def content(self):
        try:
            logger.debug("Read content from %s" % self.fullpath)
            with open(self.fullpath, 'r') as f:
                content = f.read()
            return content
        except IOError:
            logger.error("Could not read '%s'" % self.fullpath)
        return '{}'

    def all(self):
        """
        Instanciate objects on the fly
        We use edict() in order to recursively transform dicts into attributes.
        (ex.: object['properties']['districts'][0]['pk'] becomes 
              object.properties.districts[0].pk)
        """
        objects = json.loads(self.content)
        features = objects.get('features', objects)
        if isinstance(features, (list, tuple)):
            return [self.klass(objects=self, **edict(o)) for o in features]
        if isinstance(features, dict):
            return self.klass(objects=self, **edict(features))
        return features


class JSONModel(object):
    filepath = None

    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)

    @property
    def pk(self):
        return self.properties.pk

    @classproperty
    def objects(cls):
        return JSONManager(cls, cls.filepath)

    _default_manager = objects


class Settings(JSONModel):
    filepath = 'api/settings.json'


class POIs(JSONModel):
    filepath = 'api/trek/{trek__pk}/pois.geojson'


class Trek(JSONModel):
    filepath = 'api/trek/trek.geojson'
    detailpath = 'api/trek/trek-{pk}.json'

    @property
    def last_modified(self):
        t = os.path.getmtime(self.objects.fullpath)
        return datetime.datetime.fromtimestamp(t)

    @models.permalink
    def get_absolute_url(self):
        return ('trekking:redirect', (self.pk,))

    @property
    def title(self):
        keywords = _(u"From %s to %s") % (self.properties.departure, self.properties.arrival)
        return u"%s - %s - %s" % (settings.TITLE[get_language()],
                                  self.properties.name,
                                  keywords)

    @property
    def pois(self):
        return POIs.objects.filter(trek__pk=self.pk,
                                   language=self.objects.language)

    @property
    def altimetric_url(self):
        return 'api/trek/{trek__pk}/profile.json'.format(trek__pk=self.pk)

    @property
    def gpx_url(self):
        return 'api/trek/trek-{trek__pk}.gpx'.format(trek__pk=self.pk)

    @property
    def kml_url(self):
        return 'api/trek/trek-{trek__pk}.kml'.format(trek__pk=self.pk)

    @property
    def geojson(self):
        return json.dumps({
          "type": "GeometryCollection",
          "geometries": [
            { "type": self.geometry.type,
              "coordinates": self.geometry.coordinates
            }
          ]
        })

    def startcoords(self):
        if self.geometry.type.lower().startswith('multi'):
            return self.geometry.coordinates[0][:1][0]
        return self.geometry.coordinates[:1][0]

    def endcoords(self):
        if self.geometry.type.lower().startswith('multi'):
            return self.geometry.coordinates[-1][:-1][-1]
        return self.geometry.coordinates[:-1][-1]

