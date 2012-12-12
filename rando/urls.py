from django.conf import settings
from django.conf.urls import patterns, include, url


urlpatterns = patterns('',
    url(r'', include('rando.trekking.urls', namespace='trekking', app_name='trekking')),
    url(r'pages/', include('rando.flatpages.urls', namespace='flatpages', app_name='flatpages')),
)
