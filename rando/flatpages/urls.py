from django.conf.urls import patterns, include, url
from .views import page_redirect, PageView


urlpatterns = patterns('',
    url(r'^(?P<pk>\d+)$',  page_redirect, name="redirect"),
    url(r'^(?P<slug>[-\w]+)$', PageView.as_view(), name="page"),
)
