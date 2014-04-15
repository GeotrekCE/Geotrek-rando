from django.conf import settings
from django.conf.urls import patterns, include, url
from django.views.decorators.cache import cache_page
from django.views.i18n import javascript_catalog

from localeurl.sitemaps import LocaleurlSitemap
from localeurl.templatetags.localeurl_tags import chlocale

from rando.flatpages.models import FlatPage
from rando.trekking.models import Trek


class FlatPageSitemap(LocaleurlSitemap):
    changefreq = 'monthly'

    def items(self):
        return list(FlatPage.objects.filter(language=self.language).all())

    def lastmod(self, page):
        return page.last_modified


class TrekSitemap(LocaleurlSitemap):
    changefreq = 'weekly'

    def items(self):
        try:
            return list(Trek.objects.filter(language=self.language).all())
        except TypeError:
            return []

    def lastmod(self, trek):
        return trek.last_modified


class GeoSitemap(TrekSitemap):
    def location(self, trek):
        return chlocale('/' + trek.kml_url, self.language)


sitemaps = {}
for language in settings.LANGUAGES:
    lang = language[0]
    sitemaps['pages-' + lang] = FlatPageSitemap(lang)
    sitemaps['treks-' + lang] = TrekSitemap(lang)
    sitemaps['geo-' + lang] = GeoSitemap(lang)


urlpatterns = patterns('',
    url(r'^sitemap\.xml$', 'django.contrib.sitemaps.views.sitemap', {'sitemaps': sitemaps}),
    url(r'', include('rando.core.urls', namespace='core', app_name='core')),
    url(r'', include('rando.trekking.urls', namespace='trekking', app_name='trekking')),
    url(r'', include('rando.view3d.urls', namespace='view3d', app_name='view3d')),
    url(r'', include('rando.feedback.urls', namespace='feedback', app_name='feedback')),
    url(r'pages/', include('rando.flatpages.urls', namespace='flatpages', app_name='flatpages')),
    url(r'^jsi18n/$', cache_page(settings.CACHE_DURATION)(javascript_catalog), {'packages':('rando.trekking',)}, name='jsi18n'),
)


# Serve uploaded files from django directly. Assumes settings.MEDIA_URL is set to '/media/'
if settings.DEBUG:
    urlpatterns += patterns('',
        url(r'^media/(?P<path>.*)$', 'django.views.static.serve', {
            'document_root': settings.MEDIA_ROOT,
            }),
    )


if settings.PREPROD:
    # Prevents Robots indexing
    from django.http import HttpResponse
    urlpatterns += patterns('',
        url(r'^robots\.txt$', lambda r: HttpResponse("User-agent: *\nDisallow: /", mimetype="text/plain")),
    )
