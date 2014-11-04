from django.conf.urls import patterns, url

from rando.core.views import home, fileserve


urlpatterns = patterns('',
    url(r'^$', home, name="home"),
    url(r'^files(?P<path>.*)$', fileserve, name="fileserve")
)
