from django.conf.urls import patterns, include, url
from .views import PageView


urlpatterns = patterns('',
    url(r'^(?P<slug>[-\w]+)$', PageView.as_view(), name="page"),
)
