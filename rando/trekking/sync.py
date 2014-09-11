import json

from django.conf import settings
from django.template.loader import render_to_string

from rando.core.management.commands.sync_content import InputFile, JsonInputFile, reroot, cprint
from rando import logger
from rando.trekking import models


class JSONCollection(JsonInputFile):
    def content(self):
        records = []
        for record in self.fetch_list():
            if self.filter_record(record):
                logger.debug('%s filtered.' % self.url)
                continue
            records.append(self.handle_record(record))
        return self.serialize_json(records)

    def fetch_list(self):
        content = self.reply.json()
        if content is None:
            return super(JSONCollection, self).content()
        return content

    def filter_record(self, record):
        return False

    def handle_record(self, record):
        return record

    def download_resource(self, url, klass=None, **kwargs):
        if not klass:
            klass = InputFile
        if not url:
            return
        inputkw = self.initkwargs.copy()
        inputkw.pop('language')
        inputkw.update(kwargs)
        return klass(url, **inputkw).pull_if_modified()


class GeoJSONCollection(JSONCollection):
    def fetch_list(self):
        content = super(GeoJSONCollection, self).fetch_list()
        return content['features']

    def serialize_json(self, content):
        original = self.reply.json()
        original['features'] = content
        return super(GeoJSONCollection, self).serialize_json(original)


class PublishedCollection(GeoJSONCollection):

    objectname = None

    def filter_record(self, record):
        is_published = record['properties'].get('published', False)
        return not is_published

    def handle_record(self, record):
        record = super(PublishedCollection, self).handle_record(record)
        properties = record['properties']
        pk = properties.get('pk', -1)

        properties['thumbnail'] = reroot(properties.get('thumbnail'))
        properties['pictures'] = reroot(properties.get('pictures'), attr='url')

        # Fill with detail properties
        detailsource = 'api/{objectname}s/{pk}/'.format(objectname=self.objectname, pk=pk)
        detailpath = 'api/{objectname}s/{objectname}-{pk}.json'.format(objectname=self.objectname, pk=pk)
        detailfile = self.download_resource(url=detailsource, store=detailpath, klass=JsonInputFile, language=self.language)
        detail = json.loads(detailfile.content())
        properties.update(detail)

        if settings.PRINT_ENABLED and properties.get('printable'):
            self.download_resource(properties['printable'], language=self.language)

        # Download attachments list file
        url = reroot(properties['filelist_url'])
        destination = models.AttachmentFile.filepath.format(objectname=self.objectname, object__pk=pk)
        # Store destination as new official url (e.g. for Geotrek mobile)
        properties['filelist_url'] = destination
        inputkw = self.initkwargs.copy()
        inputkw['store'] = destination
        AttachmentInputFile(url, **inputkw).pull()

        # Download media files media only once, since they do not depend on language
        if self.language != settings.LANGUAGE_CODE:
            return record

        self.download_resource(properties.get('thumbnail'))
        self.download_resource(properties.get('thumbnail'))

        for picture in properties.get('pictures', []):
            self.download_resource(picture['url'])

        self.download_resource(properties['map_image_url'])

        return record


class InformationDeskInputFile(GeoJSONCollection):

    def handle_record(self, record):
        record = super(InformationDeskInputFile, self).handle_record(record)
        properties = record['properties']
        properties['photo_url'] = reroot(properties['photo_url'])
        properties['html'] = render_to_string('trekking/_information_desk.html',
                                              {'desk': properties})

        if self.language == settings.LANGUAGE_CODE:
            if properties.get('photo_url'):
                self.download_resource(properties['photo_url'])

        return record


class AttachmentInputFile(JSONCollection):

    def filter_record(self, record):
        record = super(AttachmentInputFile, self).handle_record(record)
        record['url'] = reroot(record['url'])
        # Images come through pictures list already
        is_image = record['is_image']
        # Mimetype check (either by first part or complete)
        main, category = record['mimetype']
        mimetype = '%s/%s' % (main, category)
        allowed = settings.FILELIST_MIMETYPES
        is_allowed = main in allowed or mimetype in allowed
        return is_image or not is_allowed

    def handle_record(self, record):
        record = super(AttachmentInputFile, self).handle_record(record)
        if self.language == settings.LANGUAGE_CODE:
            self.download_resource(record['url'])
        return record


class POIListInputFile(PublishedCollection):

    objectname = 'poi'

    def handle_record(self, record):
        record = super(POIListInputFile, self).handle_record(record)
        properties = record['properties']
        poitype_value = properties.pop('type')
        properties['type'] = reroot(poitype_value, attr='pictogram')

        if self.language == settings.LANGUAGE_CODE:
            self.download_resource(properties['type']['pictogram'])

        return record


class TrekListInputFile(PublishedCollection):

    objectname = 'trek'

    def filter_record(self, record):
        filtered = super(TrekListInputFile, self).filter_record(record)

        # Ignore treks that are not linestring
        if record['geometry']['type'].lower() != 'linestring':
            msg = 'Trek %s was ignored (not linestring).' % record['id']
            cprint(msg, 'red', attrs=['bold'], file=self.stderr)
            return True

        return filtered

    def handle_record(self, record):
        properties = record['properties']
        pk = properties.get('pk', -1)

        record = super(TrekListInputFile, self).handle_record(record)

        # Remove rooturl from relative URLs
        relative_props = ['altimetric_profile', 'elevation_area_url', 'gpx', 'kml',
            'map_image_url', 'printable', 'poi_layer', 'information_desk_layer']
        for k in relative_props:
            properties[k] = properties[k].replace(self.client.rooturl, '') if properties.get(k) else properties.get(k)

        # Reroot pictograms
        picto_props = ['themes', 'usages', 'difficulty', 'route', 'networks']
        for prop in picto_props:
            properties[prop] = reroot(properties[prop], attr='pictogram')

        # Reroot information desks photos
        properties['information_desks'] = reroot(properties['information_desks'], attr='photo_url')

        wl = []
        for w in properties['web_links']:
            if w.get('category'):  # Safety for uncategorized links
                w['category'] = reroot(w['category'], attr='pictogram')
            wl.append(w)
        properties['web_links'] = wl

        # Remove unpublished treks from related
        properties['relationships'] = [r for r in properties['relationships'] if r['published']]
        # For presentation purposes
        properties['relationships_departure'] = [r for r in properties['relationships'] if r['has_common_departure']]
        properties['relationships_edge'] = [r for r in properties['relationships'] if r['has_common_edge']]
        properties['relationships_circuit'] = [r for r in properties['relationships'] if r['is_circuit_step']]


        # Add POIs information in list, useful for textual search
        trek_pois = models.TrekPOIs.filepath.format(trek__pk=pk)
        f = self.download_resource(trek_pois, klass=POIListInputFile, language=self.language).pull()
        poiscontent = json.loads(f.content())
        poisprops = [poi['properties'] for poi in poiscontent['features']]
        properties['pois'] = [{'name': poiprop['name'],
                               'description': poiprop['description'],
                               'type': poiprop['type']['label']}
                              for poiprop in poisprops]

        #
        # Fetch related resources
        self.download_resource(properties['gpx'], language=self.language)
        self.download_resource(properties['kml'], language=self.language)
        self.download_resource(properties['information_desk_layer'], klass=InformationDeskInputFile, language=self.language)

        # Download media files media only once, since they do not depend on language
        if self.language == settings.LANGUAGE_CODE:
            return record

        self.download_resource(properties['altimetric_profile'])

        for theme in properties['themes']:
            self.download_resource(theme['pictogram'])
        for usage in properties['usages']:
            self.download_resource(usage['pictogram'])
        for network in properties['networks']:
            self.download_resource(network['pictogram'])

        if properties['difficulty']:
            self.download_resource(properties['difficulty']['pictogram'])
        if properties['route']:
            self.download_resource(properties['route']['pictogram'])

        for weblink in properties['web_links']:
            if weblink['category']:
                self.download_resource(properties['category']['pictogram'])

        return record


def sync_content_trekking(sender, **kwargs):
    server_settings = kwargs['server_settings']
    input_kwargs = kwargs['input_kwargs']

    languages = server_settings.languages.available.keys()
    logger.debug("Languages: %s" % languages)
    for language in languages[:1]:
        inputkwlang = dict(language=language, **input_kwargs)

        TrekListInputFile(url=models.Trek.filepath, **inputkwlang).pull()
        POIListInputFile(url=models.POI.filepath, **inputkwlang).pull()
