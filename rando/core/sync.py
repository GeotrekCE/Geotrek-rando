import json

from django.conf import settings

from rando.core import models as core_models
from rando.core.management.commands.sync_content import InputFile, JsonInputFile, reroot, cprint
from rando import logger


class JSONCollection(JsonInputFile):
    def content(self):
        content = super(JSONCollection, self).content()
        records = []
        for record in self.fetch_list(content):
            if self.filter_record(record):
                logger.debug('%s filtered.' % self.url)
                continue
            records.append(self.handle_record(record))
        return self.serialize_json(records)

    def fetch_list(self, content):
        return json.loads(content)

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
    def fetch_list(self, content):
        json = super(GeoJSONCollection, self).fetch_list(content)
        return json['features']

    def serialize_json(self, content):
        original = JsonInputFile.content(self)
        original = JSONCollection.fetch_list(self, original)
        original['features'] = content
        return super(GeoJSONCollection, self).serialize_json(original)


class PublishedCollection(GeoJSONCollection):

    objectname = None
    full = False

    def fetch_list(self, content):
        features = super(PublishedCollection, self).fetch_list(content)

        # Mode light : do not complete GeoJSON properties
        if not self.full:
            return features

        # Download list JSON
        source = 'api/{objectname}s/'.format(objectname=self.objectname)
        jsonfile = self.download_resource(url=source, klass=JsonInputFile, language=self.language)

        records = json.loads(jsonfile.content())
        records_by_id = {}
        for record in records:
            recordid = record['id']
            records_by_id[recordid] = record

            # Download detail JSON
            source = 'api/{objectname}s/{id}/'.format(objectname=self.objectname, id=recordid)
            self.download_resource(url=source, klass=JsonInputFile, language=self.language)


        # Fill this GeoJSON with detail properties
        for feature in features:
            properties = feature['properties']
            details = records_by_id[feature['id']]
            properties.update(details)

        return features

    def filter_record(self, record):
        is_published = record['properties'].get('published', False)
        return not is_published

    def handle_record(self, record):
        record = super(PublishedCollection, self).handle_record(record)
        properties = record['properties']
        pk = properties.get('pk', -1)

        properties['thumbnail'] = reroot(properties.get('thumbnail'))
        properties['pictures'] = reroot(properties.get('pictures'), attr='url')

        if settings.PRINT_ENABLED and properties.get('printable'):
            self.download_resource(properties['printable'], language=self.language)

        # Download attachments list file
        url = reroot(properties['filelist_url'])
        destination = core_models.AttachmentFile.filepath.format(objectname=self.objectname, object__pk=pk)
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
