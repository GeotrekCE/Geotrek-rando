from django.conf import settings
from django.conf.urls import patterns, url
from django.views.decorators.cache import cache_page

from .views import TrekView3D


urlpatterns = patterns('',
    url(r'^3d/(?P<slug>[-\w]+)$', cache_page(settings.CACHE_DURATION)(TrekView3D.as_view()), name="view3d"),
)
