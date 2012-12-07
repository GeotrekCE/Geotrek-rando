import logging
import json
from os.path import join

from django.conf import settings


logger = logging.getLogger(__name__)



class classproperty(object):
    def __init__(self, getter):
        self.getter = getter
 
    def __get__(self, instance, owner):
        return self.getter(owner)


class JSONManager(object):
    def __init__(self, filepath):
        fullpath = join(settings.INPUT_DATA_ROOT, filepath)
        try:
            f = open(fullpath, 'r')
            self.content = f.read()
            f.close()
        except:
            logger.error("Could not read '%s'" % fullpath)
            self.content = '{}'

    def all(self):
        return json.loads(self.content)


class JSONModel(object):
    filepath = None

    @classproperty
    def objects(cls):
        return JSONManager(cls.filepath)

    _default_manager = objects


class Settings(JSONModel):
    filepath = 'api/settings.json'


class Trek(JSONModel):
    filepath = 'api/trek/trek.geojson'


class District(JSONModel):
    filepath = 'api/district/district.geojson'