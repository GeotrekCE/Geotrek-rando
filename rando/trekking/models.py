import os
import re
import json
import HTMLParser

from django.conf import settings
from django.db import models
from django.utils.translation import get_language, ugettext_lazy as _
from django.utils.html import strip_tags

from rando.core.models import JSONModel, GeoJSONModel


class POIs(GeoJSONModel):
    filepath = 'api/trek/{trek__pk}/pois.geojson'


class AttachmentFile(JSONModel):
    filepath = 'api/trek/{trek__pk}/attachments.json'


class Trek(GeoJSONModel):
    filepath = 'api/trek/trek.geojson'
    detailpath = 'api/trek/trek-{pk}.json'

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
