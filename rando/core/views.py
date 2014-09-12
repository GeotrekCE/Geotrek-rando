import os
import mimetypes

from django.http import Http404
from django.views.generic import DetailView
from django.conf import settings
from django.views.static import serve as static_serve

from djpjax import PJAXResponseMixin


class BaseView(PJAXResponseMixin, DetailView):

    model = None
    template_name = 'detail.html'
    pjax_template_name = "_detail_panel.html"

    def pictures(self):
        trek = self.get_object()
        all_pictures = trek.pictures
        for poi in trek.pois.all():
            all_pictures.extend(poi.pictures)
        return all_pictures

    def get_context_data(self, **kwargs):
        context = super(BaseView, self).get_context_data(**kwargs)

        modelname = self.model.__name__.lower()
        context[modelname] = obj = self.get_object()
        context['thumbnail'] = self.request.build_absolute_uri(obj.thumbnail)
        return context

    def get_object(self):
        slug = self.kwargs.get(self.slug_url_kwarg, None)
        lang = self.request.LANGUAGE_CODE
        for instance in self.model.objects.filter(language=lang).all():
            if instance.slug == slug:
                return instance
        raise Http404


def fileserve(request, path):
    """
    Rewrite URLs to use current language as folder root prefix.
    TODO: Could be done with ``mod_rewrite`` at deployment.
    """

    if '.geojson' not in mimetypes.types_map:
        mimetypes.add_type('application/json', '.geojson')
    if '.gpx' not in mimetypes.types_map:
        mimetypes.add_type('application/gpx+xml', '.gpx')
    if '.kml' not in mimetypes.types_map:
        mimetypes.add_type('application/vnd.google-earth.kml+xml', '.kml')
    if '.kmz' not in mimetypes.types_map:
        mimetypes.add_type('application/vnd.google-earth.kmz', '.kmz')

    path = path[1:] if path.startswith('/') else path
    if not os.path.exists(os.path.join(settings.INPUT_DATA_ROOT, path)):
        path = os.path.join(request.LANGUAGE_CODE, path)
    return static_serve(request, path, document_root=settings.INPUT_DATA_ROOT)
