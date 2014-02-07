from django.conf import settings
from .models import Trek, Settings


def main(request):
    server_settings = Settings.objects.all()
    try:
        extent = server_settings.map.extent
    except AttributeError:
        extent = [0,0,0,0]

    return {
        'treks_url': Trek.filepath,
        'map_extent': extent,

        'PRINT_ENABLED': settings.PRINT_ENABLED,
        'VIEW3D_ENABLED': settings.VIEW3D_ENABLED,
    }