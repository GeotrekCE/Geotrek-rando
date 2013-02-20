import os
import logging

from django.http import Http404
from django.conf import settings
from django.views.generic import TemplateView, DetailView
from django.views.static import serve as static_serve
from django.shortcuts import redirect
from djpjax import PJAXResponseMixin

from .models import Trek


logger = logging.getLogger(__name__)


class HomeView(PJAXResponseMixin, TemplateView):

    template_name = 'trekking/home.html'
    pjax_template_name = "trekking/home-panel.html"

    def get_context_data(self, **kwargs):
        lang = self.request.LANGUAGE_CODE
        context = super(HomeView, self).get_context_data(**kwargs)
        context['treks'] = Trek.objects.filter(language=lang).all()
        return context


class TrekView(PJAXResponseMixin, DetailView):

    template_name = 'trekking/detail.html'
    pjax_template_name = "trekking/detail-panel.html"

    def get_object(self):
        slug = self.kwargs.get(self.slug_url_kwarg, None)
        lang = self.request.LANGUAGE_CODE
        for trek in Trek.objects.filter(language=lang).all():
            if trek.properties.slug == slug:
                return trek
        raise Http404

    def get_context_data(self, **kwargs):
        lang = self.request.LANGUAGE_CODE
        obj = self.get_object()
        context = super(DetailView, self).get_context_data(**kwargs)
        context['trek'] = obj
        context['poisjson'] = obj.pois.filter(language=lang).content
        return context


def trek_redirect(request, pk):
    lang = request.LANGUAGE_CODE
    treks = Trek.objects.filter(language=lang, pk=int(pk)).all()
    if len(treks) < 1:
        raise Http404
    return redirect('trekking:detail', slug=treks[0].properties.slug)


def fileserve(request, path):
    """
    Rewrite URLs to use current language as folder root prefix.
    TODO: Could be done with ``mod_rewrite`` at deployment.
    """
    path = path[1:] if path.startswith('/') else path
    path = os.path.join(request.LANGUAGE_CODE, path)
    return static_serve(request, path, document_root=settings.INPUT_DATA_ROOT)
