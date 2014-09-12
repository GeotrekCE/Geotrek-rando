import json

from django.http import Http404, HttpResponse
from django.core.urlresolvers import reverse

from rando.core.views import BaseView
from rando.core.utils import locale_redirect
from .models import FlatPage


class PageView(BaseView):

    template_name = "flatpages/base.html"
    pjax_template_name = "flatpages/_base_panel.html"

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
        return locale_redirect("flatpages:page",
                               kwargs={'slug': pages[0].slug()},
                               locale=lang)
    raise Http404



def pages_json(request):
    """
    Returns a JSON to describe all flat pages.
    """
    lang = request.LANGUAGE_CODE

    results = []
    for page in FlatPage.objects.filter(language=lang).all():
        result = {
            'title': page.title,
            'slug': page.slug(),
            'last_modified': page.last_modified.isoformat(),
            'target': page.target,
            'content': page.content,
            'media': page.parse_media(),
            'url': reverse('flatpages:page', kwargs={'slug': page.slug()})
        }
        results.append(result)

    response = HttpResponse(content_type='application/json')
    json.dump(results, response)
    return response
