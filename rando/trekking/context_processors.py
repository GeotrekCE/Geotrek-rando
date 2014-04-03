from django.conf import settings

from rando.core.models import Settings
from rando.trekking.models import Trek


def main(request):
    server_settings = Settings.objects.all()
    try:
        extent = server_settings.map.extent
    except AttributeError:
        extent = [0,0,0,0]

    return {
        'treks_url': Trek.filepath,
        'map_extent': extent,
        'FLATPAGES_POLICY_PAGE': settings.FLATPAGES_POLICY_PAGE,
        'PRINT_ENABLED': settings.PRINT_ENABLED,
        'VIEW3D_ENABLED': settings.VIEW3D_ENABLED,
    }
