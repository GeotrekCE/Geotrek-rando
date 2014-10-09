from django.conf.urls import patterns, url
from .views import page_redirect, PageView


urlpatterns = patterns('',
    url(r'^pages/(?P<pk>\d+)$',  page_redirect, name="redirect"),
    url(r'^pages/(?P<slug>[-\w]+)$', PageView.as_view(), name="page"),
)
