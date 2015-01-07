from django.conf import settings

from rando.core.sync import JSONCollection, reroot
from rando.flatpages import models as flatpages_models


class FlatpageInputFile(JSONCollection):

    def filter_record(self, record):
        is_published = record.get('published', False)
        return not is_published

    def handle_record(self, record):
        for medium in record['media']:
            url = medium['url']
            # Media served by Geotrek-admin : download locally!
            if url.startswith('/'):
                if self.language == settings.LANGUAGE_CODE:
                    self.download_resource(url)
                medium['url'] = reroot(url)
        return record


def sync_content_flatpages(sender, **kwargs):

    if not settings.FLATPAGES_ENABLED:
        return

    server_settings = kwargs['server_settings']
    inputkw = kwargs['input_kwargs']
    languages = server_settings.languages.available.keys()

    for language in languages:
        inputkwlang = dict(language=language, **inputkw)

        FlatpageInputFile(url=flatpages_models.FlatPage.filepath, **inputkwlang).pull_if_modified()
