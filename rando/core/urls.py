from django.conf.urls import patterns, url

from rando.core.views import fileserve


urlpatterns = patterns('',
    url(r'^files(?P<path>.*)$', fileserve, name="fileserve")
)
