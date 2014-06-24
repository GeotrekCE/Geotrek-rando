from rando.trekking.views import BaseTrekView


class TrekView3D(BaseTrekView):
    template_name = 'view3d/view3d.html'

    def tiles_url(self):
        return "https://a.tiles.mapbox.com/v3/makina-corpus.i3p1001l/{z}/{x}/{y}.png"
