import logging

from django.views.generic import TemplateView


from .models import Trek, District

logger = logging.getLogger(__name__)


class HomeView(TemplateView):

    template_name = 'trekking/home.html'

    def get_context_data(self, **kwargs):
        context = super(HomeView, self).get_context_data(**kwargs)
        context['treks'] = Trek.objects.all()
        context['treksjson'] = Trek.objects.content
        context['districts'] = District.objects.all()
        return context
