import logging
import json
from os.path import join


from easydict import EasyDict as edict
from django.conf import settings


logger = logging.getLogger(__name__)



class classproperty(object):
    def __init__(self, getter):
        self.getter = getter
 
    def __get__(self, instance, owner):
        return self.getter(owner)


class JSONManager(object):
    def __init__(self, klass, filepath=None, language=None):
        self.klass = klass
        self.filepath = filepath
        self.language = language or settings.LANGUAGE_CODE

    def filter(self, **kwargs):
        self.__dict__.update(**kwargs)
        return self

    @property
    def content(self):
        self.filepath = self.filepath.format(**self.__dict__)
        fullpath = join(settings.INPUT_DATA_ROOT, 
                        self.language, self.filepath)
        try:
            logger.debug("Read content from %s" % fullpath)
            with open(fullpath, 'r') as f:
                content = f.read()
            return content
        except:
            logger.error("Could not read '%s'" % fullpath)
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

    @property
    def pois(self):
        return POIs.objects.filter(trek__pk=self.pk,
                                   language=self.objects.language)


class District(JSONModel):
    filepath = 'api/district/district.geojson'