from django.conf import settings

from rando.core.views import BaseView
from .models import Trek, POI


class POIDetail(BaseView):

    model = POI
    pjax_template_name = "trekking/_poi_detail.html"


class BaseTrekView(BaseView):

    model = Trek


class TrekDetail(BaseTrekView):

    pjax_template_name = "trekking/_trek_detail.html"

    def get_context_data(self, **kwargs):
        context = super(TrekDetail, self).get_context_data(**kwargs)
        obj = context['trek']

        context['trek_has_related'] = (len(obj.relationships_departure) > 0 or
                                       len(obj.relationships_edge) > 0 or
                                       len(obj.relationships_circuit))

        context['pois'] = obj.pois.all()

        context['park_center_warning'] = settings.PARK_CENTER_WARNING.get(self.request.LANGUAGE_CODE,
                                                                          settings.PARK_CENTER_WARNING.get(settings.LANGUAGE_CODE, ''))
        context['park_center_link'] = settings.PARK_CENTER_LINK.get(self.request.LANGUAGE_CODE,
                                                                    settings.PARK_CENTER_LINK.get(settings.LANGUAGE_CODE, ''))
        return context
