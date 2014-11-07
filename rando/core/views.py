import os
import mimetypes

from django.http import Http404
from django.views.generic import RedirectView, DetailView
from django.conf import settings
from django.views.static import serve as static_serve
from django.views.decorators.cache import cache_page
from djpjax import PJAXResponseMixin

from rando.core.utils import locale_redirect


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
        context['modelname'] = modelname
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
    path = path + 'index.json' if path.endswith('/') else path

    if not os.path.exists(os.path.join(settings.INPUT_DATA_ROOT, path)):
        path = os.path.join(request.LANGUAGE_CODE, path)
    return static_serve(request, path, document_root=settings.INPUT_DATA_ROOT)


class DetailRedirect(RedirectView):
    model = None

    def get_redirect_url(self, *args, **kwargs):
        lang = self.request.LANGUAGE_CODE
        instances = self.model.objects.filter(language=lang).all()
        for instance in instances:
            if instance.pk == int():
                return locale_redirect('trekking:trek_detail',
                                       kwargs={'slug': instance.slug},
                                       locale=lang)
        return None  # 410 - Gone


from django.views.generic import TemplateView

from rando import logger

from rando.trekking.models import Trek, POI


class Home(PJAXResponseMixin, TemplateView):

    template_name = 'home.html'
    pjax_template_name = "_home_panel.html"

    def get_context_data(self, **kwargs):
        context = super(Home, self).get_context_data(**kwargs)

        lang = self.request.LANGUAGE_CODE
        alltreks = Trek.objects.filter(language=lang).all()
        if len(alltreks) == 0:
            logger.warn("No trek found for lang %s." % lang)
        allpois = POI.objects.filter(language=lang).all()
        if len(allpois) == 0:
            logger.warn("No POI found for lang %s." % lang)

        context['treks'] = alltreks
        context['pois'] = allpois
        return context

home = cache_page(settings.CACHE_DURATION)(Home.as_view())