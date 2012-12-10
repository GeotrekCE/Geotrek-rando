import logging

from django.views.generic import TemplateView, DetailView


from .models import Trek, District, Settings

logger = logging.getLogger(__name__)


class HomeView(TemplateView):

    template_name = 'trekking/home.html'

    def get_context_data(self, **kwargs):
        context = super(HomeView, self).get_context_data(**kwargs)
        context['treks'] = Trek.objects.all()
        context['treksjson'] = Trek.objects.content
        context['districts'] = District.objects.all()
        context['settings'] = Settings.objects.all()
        return context


class TrekView(DetailView):
    template_name = 'trekking/detail.html'

    def get_object(self):
        slug = self.kwargs.get(self.slug_url_kwarg, None)
        for trek in Trek.objects.all():
            if trek.properties.slug == slug:
                return trek
        raise Http404

    def get_context_data(self, **kwargs):
        context = super(DetailView, self).get_context_data(**kwargs)
        context['settings'] = Settings.objects.all()
        context['poisjson'] = self.get_object().pois.content
        return context