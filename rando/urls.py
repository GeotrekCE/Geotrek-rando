from django.conf import settings
from django.conf.urls import patterns, include, url


urlpatterns = patterns('',
    url(r'', include('rando.trekking.urls', namespace='trekking', app_name='trekking')),
    url(r'pages/', include('rando.flatpages.urls', namespace='flatpages', app_name='flatpages')),
)


# Serve uploaded files from django directly. Assumes settings.MEDIA_URL is set to '/media/'
if settings.DEBUG:
    urlpatterns += patterns('',
        url(r'^media/(?P<path>.*)$', 'django.views.static.serve', {
            'document_root': settings.MEDIA_ROOT,
            }),
    )
