import logging

from django.http import Http404
from django.views.generic import TemplateView, DetailView

from .models import Trek, District, Settings


logger = logging.getLogger(__name__)


class HomeView(TemplateView):

    template_name = 'trekking/home.html'

    def get_context_data(self, **kwargs):
        lang = self.request.LANGUAGE_CODE
        context = super(HomeView, self).get_context_data(**kwargs)
        context['treks'] = Trek.objects.filter(language=lang).all()
        context['treksjson'] = Trek.objects.filter(language=lang).content
        context['districts'] = District.objects.all()
        context['settings'] = Settings.objects.all()
        return context


class TrekView(DetailView):
    template_name = 'trekking/detail.html'

    def get_object(self):
        slug = self.kwargs.get(self.slug_url_kwarg, None)
        lang = self.request.LANGUAGE_CODE
        for trek in Trek.objects.filter(language=lang).all():
            if trek.properties.slug == slug:
                return trek
        raise Http404

    def get_context_data(self, **kwargs):
        lang = self.request.LANGUAGE_CODE
        context = super(DetailView, self).get_context_data(**kwargs)
        context['settings'] = Settings.objects.all()
        context['poisjson'] = self.get_object().pois.filter(language=lang).content
        return context