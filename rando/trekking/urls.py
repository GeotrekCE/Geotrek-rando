from django.conf import settings
from django.conf.urls import patterns, url
from .views import HomeView, TrekView, TrekView3D, trek_redirect, fileserve
from django.views.decorators.cache import cache_page


urlpatterns = patterns('',
    url(r'^$', cache_page(settings.CACHE_DURATION)(HomeView.as_view()), name="home"),
    url(r'^3d/(?P<slug>[-\w]+)$', cache_page(settings.CACHE_DURATION)(TrekView3D.as_view()), name="view3d"),
    url(r'^(?P<slug>[-\w]+)$', cache_page(settings.CACHE_DURATION)(TrekView.as_view()), name="detail"),
    url(r'^to/(?P<pk>\d+)$', trek_redirect, name="redirect"),

    url(r'^files/(?P<path>.*)$', fileserve, name="fileserve")
)
