from django.conf.urls import patterns, url
from .views import page_redirect, pages_json, PageView


urlpatterns = patterns('',
    url(r'^files/api/pages/pages.json$',  pages_json, name="json_list"),
    url(r'^pages/(?P<pk>\d+)$',  page_redirect, name="redirect"),
    url(r'^pages/(?P<slug>[-\w]+)$', PageView.as_view(), name="page"),
)
