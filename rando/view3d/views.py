from django.conf import settings
from django.core.exceptions import ImproperlyConfigured

from rando.trekking.views import BaseTrekView


class TrekView3D(BaseTrekView):
    template_name = 'view3d/view3d.html'

    TILES_NUMBER_LIMIT = settings.VIEW3D_TILES_NUMBER_LIMIT
    VIEW3D_CAMERAS_ENABLED = settings.VIEW3D_CAMERAS_ENABLED

    def tiles(self):
        for tiles_layer in settings.LEAFLET_CONFIG['TILES']:
            if tiles_layer[0] == 'satellite':
                return {
                    'url': tiles_layer[1],
                    'attributions': tiles_layer[2]
                }
        raise ImproperlyConfigured("No layer 'satellite' found in settings  ")