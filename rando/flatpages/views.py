import logging

from django.views.generic import DetailView
from djpjax import PJAXResponseMixin

from .models import FlatPage


logger = logging.getLogger(__name__)


class PageView(PJAXResponseMixin, DetailView):

    template_name = "flatpages/base.html"
    pjax_template_name = "flatpages/base-panel.html"

    def get_object(self):
        slug = self.kwargs.get(self.slug_url_kwarg, None)
        lang = self.request.LANGUAGE_CODE
        try:
            return FlatPage.objects.filter(language=lang).get(slug=slug)
        except:
            raise Http404
