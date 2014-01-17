import os
import re
import datetime
import json
import HTMLParser

from easydict import EasyDict as edict
from django.conf import settings
from django.db import models
from django.utils.translation import get_language, ugettext_lazy as _
from django.utils.html import strip_tags

from rando import classproperty, logger


class JSONManager(object):
    def __init__(self, klass, filepath=None, language=None, use_tmp=False):
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

    @classproperty
    def tmp_objects(cls):
        return JSONManager(cls, cls.filepath, use_tmp=True)

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
        keywords = _(u"From %(departure)s to %(arrival)s") % {
            'departure': self.properties.departure,
            'arrival': self.properties.arrival
        }
        title = settings.TITLE.get(get_language(),
                                   settings.TITLE.get(settings.LANGUAGE_CODE, ''))
        return u"%s - %s - %s" % (title,
                                  self.properties.name,
                                  keywords)

    @property
    def pois(self):
        return POIs.objects.filter(trek__pk=self.pk,
                                   language=self.objects.language)

    @property
    def geojson(self):
        return json.dumps({
          "type": "Feature",
          "geometry": { "type": self.geometry.type,
              "coordinates": self.geometry.coordinates
           },
           "properties": self.properties,
        })

    @property
    def altimetricprofile(self):
        source = os.path.join(settings.INPUT_DATA_ROOT, self.objects.language, self.properties.altimetric_profile[1:])
        try:
            jsonsource = open(source, 'r').read()
            jsonparsed = json.loads(jsonsource)
            return jsonparsed['profile']
        except (IOError, KeyError):
            return []

    @property
    def main_image(self):
        try:
            first = self.properties.pictures[0]
            return first['url']
        except IndexError:
            return None

    @property
    def fulltext(self):
        fields = []
        for field in ['name', 'departure', 'arrival', 'ambiance',
                      'description_teaser', 'description', 'access',
                      'advice']:
            fields.append(self.properties.get(field, ''))

        cities = [city.name for city in self.properties.cities]
        fields.append(''.join(cities))
        citiescodes = [city.code for city in self.properties.cities]
        fields.append(''.join(citiescodes))
        districts = [district.name for district in self.properties.districts]
        fields.append(''.join(districts))

        for poi in self.properties.pois:
            fields.append(poi.name)
            fields.append(poi.description)
            fields.append(poi.type)

        words = []
        for field in fields:
            words.extend(re.findall(r"[\w&;']+", field))
        words = [w for w in set(words) if len(w) > 3]

        fulltext = strip_tags(u''.join(words))
        html_parser = HTMLParser.HTMLParser()
        fulltext = html_parser.unescape(fulltext)
        fulltext = re.sub(r'\W*\b\w{1,3}\b', '', fulltext)
        fulltext = re.sub(r'[\s,\.\']', '', fulltext)
        fulltext = fulltext.lower()
        return fulltext
