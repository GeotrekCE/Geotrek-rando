from django.conf import settings

from rando.core.management.commands.sync_content import InputFile
from rando.tourism.models import DataSource
from rando import logger


def sync_content_tourism(sender, **kwargs):
    if not settings.TOURISM_ENABLED:
        return

    server_settings = kwargs['server_settings']
    inputkw = kwargs['input_kwargs']

    languages = server_settings.languages.available.keys()
    logger.debug("Languages: %s" % languages)
    for language in languages:
        inputkwlang = dict(language=language, **inputkw)
        InputFile(DataSource.filepath, **inputkwlang).pull_if_modified()

        for datasource in DataSource.tmp_objects.filter(language=language).all():
            InputFile(datasource.geojson_url, **inputkwlang).pull_if_modified()

        for datasource in DataSource.tmp_objects.filter(language=language).all():
            InputFile(datasource.pictogram_url, **inputkw).pull_if_modified()
