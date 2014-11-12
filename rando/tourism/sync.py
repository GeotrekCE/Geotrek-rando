from django.conf import settings

from rando.core.sync import JSONCollection, GeoJSONCollection, PublishedCollection, reroot
from rando.tourism import models as tourism_models
from rando import logger
from django.template.loader import render_to_string


class DataSourceInputFile(JSONCollection):

    def handle_record(self, record):
        geojson_url = record['geojson_url']
        try:
            self.download_resource(geojson_url, language=self.language)
        except IOError:
            logger.error("Could not retrieve datasource %s" % geojson_url)
            if not settings.TOURISM_DATASOURCE_FAULT_TOLERANT:
                raise

        if self.language == settings.LANGUAGE_CODE:
            self.download_resource(record['pictogram_url'])

        return record


class TouristicContentCategoriesInputFile(JSONCollection):

    def handle_record(self, record):
        if self.language == settings.LANGUAGE_CODE:
            self.download_resource(record['pictogram'])
        return record


class TouristicContentInputFile(PublishedCollection):
    pass


class TouristicEventInputFile(PublishedCollection):
    pass


class InformationDeskInputFile(GeoJSONCollection):

    def handle_record(self, record):
        record = super(InformationDeskInputFile, self).handle_record(record)
        properties = record['properties']
        properties['photo_url'] = reroot(properties['photo_url'])
        properties['html'] = render_to_string('trekking/_information_desk.html',
                                              {'desk': properties})

        poitype_value = properties.pop('type')
        properties['type'] = reroot(poitype_value, attr='pictogram')

        if self.language == settings.LANGUAGE_CODE:
            self.download_resource(properties['type']['pictogram'])
            if properties.get('photo_url'):
                self.download_resource(properties['photo_url'])

        return record


def sync_content_tourism(sender, **kwargs):

    if not settings.TOURISM_ENABLED:
        return

    server_settings = kwargs['server_settings']
    inputkw = kwargs['input_kwargs']

    languages = server_settings.languages.available.keys()
    logger.debug("Languages: %s" % languages)
    for language in languages:
        inputkwlang = dict(language=language, **inputkw)

        DataSourceInputFile(url=tourism_models.DataSource.filepath, **inputkwlang).pull_if_modified()
        InformationDeskInputFile(url=tourism_models.InformationDesk.filepath, **inputkwlang).pull_if_modified()
        TouristicContentCategoriesInputFile(url=tourism_models.TouristicContentCategories.filepath, **inputkwlang).pull_if_modified()
        TouristicContentInputFile(url=tourism_models.TouristicContent.filepath, **inputkwlang).pull_if_modified()
        TouristicEventInputFile(url=tourism_models.TouristicEvent.filepath, **inputkwlang).pull_if_modified()
