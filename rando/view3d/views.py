from operator import itemgetter

from rando.core.models import Settings
from rando.trekking.views import BaseTrekView


class TrekView3D(BaseTrekView):
    template_name = 'view3d/view3d.html'

    def get_context_data(self, **kwargs):
        trek = self.get_object()
        context = super(TrekView3D, self).get_context_data(**kwargs)
        context['coords3d'] = self.coords3d(trek)
        return context

    def coords3d(self, trek):
        """Returns list of lists [x, y, h] to be plotted in WebGL.
        """
        server_settings = Settings.objects.all()
        if server_settings.version < '0.20':
            # Retro-compatibility
            # Zip together lat/lngs and elevation
            coords2d = trek.geometry.coordinates
            xs = map(itemgetter(0), coords2d)
            ys = map(itemgetter(1), coords2d)
            altitudes = map(itemgetter(1), trek.altimetricprofile)
            coords3d = zip(xs, ys, altitudes)
            coords3d = map(list, coords3d)
            return coords3d
        # From Geotrek version 0.20, lat/lngs come along
        # altimetric profile (since they don't match geometry vertices anymore)
        # (distance, elevation, (lng, lat))
        coords3d = [[i[2][0], i[2][1], i[1]] for i in trek.altimetricprofile]
        return coords3d
