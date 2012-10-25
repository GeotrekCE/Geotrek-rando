from os.path import join

from django.views.generic import TemplateView
from django.conf import settings


class HomeView(TemplateView):

    template_name = 'trekking/home.html'

    def get_context_data(self, **kwargs):

        context = super(HomeView, self).get_context_data(**kwargs)
        path = join(settings.INPUT_DATA_ROOT, 'api/trek/trek.geojson')
        with open(path) as f:
            context['geojson'] = f.read()
        return context
