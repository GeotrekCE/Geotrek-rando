from django.http import Http404
from django.views.generic import DetailView
from django.shortcuts import redirect
from djpjax import PJAXResponseMixin

from .models import FlatPage


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


def page_redirect(request, pk):
    lang = request.LANGUAGE_CODE
    pages = [p for p in FlatPage.objects.filter(language=lang, pk=pk).all()]
    if len(pages) > 0:
        return redirect("flatpages:page", pages[0].slug())
    raise Http404