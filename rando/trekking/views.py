import os
import logging

from django.http import Http404
from django.conf import settings
from django.core.urlresolvers import reverse
from django.views.generic import TemplateView, DetailView
from django.views.static import serve as static_serve
from django.shortcuts import redirect
from djpjax import PJAXResponseMixin
from localeurl.utils import locale_url

from .models import Trek


logger = logging.getLogger(__name__)


class HomeView(PJAXResponseMixin, TemplateView):

    template_name = 'trekking/home.html'
    pjax_template_name = "trekking/home-panel.html"

    def get_context_data(self, **kwargs):
        lang = self.request.LANGUAGE_CODE
        alltreks = Trek.objects.filter(language=lang).all()
        if not isinstance(alltreks, list):
            logger.error("No trek found.")
            alltreks = []
        context = super(HomeView, self).get_context_data(**kwargs)
        context['treks'] = alltreks
        return context


class BaseTrekView(DetailView):

    def get_object(self):
        slug = self.kwargs.get(self.slug_url_kwarg, None)
        lang = self.request.LANGUAGE_CODE
        for trek in Trek.objects.filter(language=lang).all():
            if trek.properties.slug == slug:
                return trek
        raise Http404


class TrekView(PJAXResponseMixin, BaseTrekView):

    template_name = 'trekking/detail.html'
    pjax_template_name = "trekking/detail-panel.html"

    def get_poi_type(self, poi):
        return poi.properties.type

    def get_poi_label(self, poi):
        return poi.properties.name

    def get_context_data(self, **kwargs):
        lang = self.request.LANGUAGE_CODE
        obj = self.get_object()
        context = super(TrekView, self).get_context_data(**kwargs)
        context['trek'] = obj
        context['thumbnail'] = self.request.build_absolute_uri(obj.properties.thumbnail)
        context['poisjson'] = obj.pois.filter(language=lang).content

        pois = obj.pois.all()

        # Merge pictures of trek and POIs
        all_pictures = obj.properties.pictures
        for poi in pois:
            all_pictures.extend(poi.properties.pictures)
        context['all_pictures'] = all_pictures

        pois_sorted_by_label = sorted(pois, key=self.get_poi_label)
        context['pois'] = sorted(pois_sorted_by_label, key=self.get_poi_type)

        context['PRINT_ENABLED'] = settings.PRINT_ENABLED
        context['VIEW3D_ENABLED'] = settings.VIEW3D_ENABLED
        return context


class TrekView3D(BaseTrekView):
    template_name = 'trekking/view3d.html'

    def get_context_data(self, **kwargs):
        trek = self.get_object()
        context = super(TrekView3D, self).get_context_data(**kwargs)
        context['coords3d'] = trek.coords3d()
        return context


def trek_redirect(request, pk):
    lang = request.LANGUAGE_CODE
    treks = Trek.objects.filter(language=lang).all()
    for trek in treks:
        if trek.pk == int(pk):
            fullurl = reverse('trekking:detail', kwargs={'slug': trek.properties.slug})
            # In case, reverse() does not prefix locale, force it.
            if not fullurl.startswith('/%s' % lang):
                fullurl = locale_url(fullurl, locale=lang)
            return redirect(fullurl)
    raise Http404


def fileserve(request, path):
    """
    Rewrite URLs to use current language as folder root prefix.
    TODO: Could be done with ``mod_rewrite`` at deployment.
    """
    path = path[1:] if path.startswith('/') else path
    path = os.path.join(request.LANGUAGE_CODE, path)
    return static_serve(request, path, document_root=settings.INPUT_DATA_ROOT)
