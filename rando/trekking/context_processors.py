from django.conf import settings

from rando.core.models import Settings
from rando.trekking.models import Trek


def main(request):
    server_settings = Settings.objects.all()
    try:
        extent = server_settings.map.extent
    except AttributeError:
        extent = [0,0,0,0]

    def trans(setting):
        default = setting.get(settings.LANGUAGE_CODE, '')
        return setting.get(request.LANGUAGE_CODE, default)

    return {
        'treks_url': '/' + Trek.filepath,
        'map_extent': extent,
        'DISTRICT_LABEL': trans(settings.DISTRICT_LABEL),
        'FLATPAGES_POLICY_PAGE': settings.FLATPAGES_POLICY_PAGE,
        'SEARCH_PLACEHOLDER': trans(settings.SEARCH_PLACEHOLDER),
        'PRINT_ENABLED': settings.PRINT_ENABLED,
        'VIEW3D_ENABLED': settings.VIEW3D_ENABLED,
        'POI_PANEL_OPENED' : settings.POI_PANEL_OPENED,
        'TREK_SHOW_DESCENT': settings.TREK_SHOW_DESCENT,
    }
