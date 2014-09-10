from django.conf import settings
from django.conf.urls import patterns, url
from . import views as trekking_views
from django.views.decorators.cache import cache_page


urlpatterns = patterns('',
    url(r'^$', cache_page(settings.CACHE_DURATION)(trekking_views.TrekHome.as_view()), name="trek_home"),
    url(r'^(?P<slug>[-\w]+)$', cache_page(settings.CACHE_DURATION)(trekking_views.TrekDetail.as_view()), name="trek_detail"),
    url(r'^to/(?P<pk>\d+)$', trekking_views.trek_redirect, name="trek_redirect"),
)
