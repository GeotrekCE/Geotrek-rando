from rando.core.management.commands.sync_content import InputFile
from rando.tourism.models import DataSource


def sync_content_tourism(sender, **kwargs):
    inputkw = kwargs['input_kwargs']
    InputFile(DataSource.filepath, **inputkw).pull_if_modified()

    for datasource in DataSource.tmp_objects.all():
        InputFile(datasource.geojson_url, **inputkw).pull_if_modified()
        InputFile(datasource.pictogram_url, **inputkw).pull_if_modified()
