# -*- coding: utf8 -*-

from django.conf.urls import patterns, url
from .views import FeedBackView, LeafletView


urlpatterns = patterns(
    '',
    url(r'feedback/(?P<slug>[-\w]+)$', FeedBackView.as_view(), name='feedback_view'),
    #url(r'leaflet/(?P<slug>[-\w]+)/$', LeafletView.as_view(), name='leaflet_view'),
)
