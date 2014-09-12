from django.conf import settings
from django.conf.urls import patterns, url
from django.views.decorators.cache import cache_page

from rando.core import views as core_views
from rando.trekking import views as trekking_views
from rando.trekking import models as trekking_models


urlpatterns = patterns('',
    url(r'^poi/(?P<slug>[-\w]+)$', cache_page(settings.CACHE_DURATION)(trekking_views.POIDetail.as_view()), name="poi_detail"),
    url(r'^poi/to/(?P<pk>\d+)$', core_views.DetailRedirect.as_view(model=trekking_models.POI), name="poi_redirect"),
    url(r'^(?P<slug>[-\w]+)$', cache_page(settings.CACHE_DURATION)(trekking_views.TrekDetail.as_view()), name="trek_detail"),
    url(r'^to/(?P<pk>\d+)$', core_views.DetailRedirect.as_view(model=trekking_models.Trek), name="trek_redirect"),
)
