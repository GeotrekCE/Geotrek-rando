from django.conf import settings

from rando.trekking.models import Trek
from rando.core.management.commands.sync_content import InputFile


def sync_content_view3d(sender, **kwargs):
    if not settings.VIEW3D_ENABLED:
        return

    input_kwargs = kwargs['input_kwargs']

    for trek in Trek.tmp_objects.filter(language=settings.LANGUAGE_CODE).all():
        InputFile(trek.elevation_area_url, **input_kwargs).pull_if_modified()
