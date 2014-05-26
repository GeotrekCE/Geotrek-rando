import requests
from urlparse import urlparse
from os.path import join

from django.conf import settings

from rando import __version__, logger


class GeotrekClient(object):
    def __init__(self):
        self.server = settings.GEOTREK_SERVER

        if 'http' not in self.server:
            self.server = 'http://' + self.server
        if self.server.endswith('/'):
            self.server = self.server[:-1]
        parts = urlparse(self.server)

        self.rooturl = parts.path
        if len(self.rooturl) <= 1:
            self.rooturl = ''

        self.session = None or requests

    def absolute_url(self, url):
        """
        Joins the Geotrek server url with the specified url. Tricky in the case
        the Geotrek admin serves the application on a subfolder (e.g. /geotrek).
        """
        url = url[1:] if url.startswith('/') else url
        url = url.replace(self.rooturl, '')
        return join(self.server, url)

    def _set_headers_kwargs(self, kwargs):
        headers = kwargs.get('headers', {})
        if 'User-Agent' not in headers:
            headers.update({'User-Agent': 'geotrek-rando/%s' % __version__})
        kwargs['headers'] = headers
        return kwargs

    def login(self):
        self.session = requests.Session()
        response = self.post(settings.GEOTREK_LOGIN_URL,
                             data={'username': settings.GEOTREK_USER,
                                   'password': settings.GEOTREK_PASSWORD},
                             allow_redirects=False)
        assert response.status_code == 302, "Failed to login on API with current settings"

    def get(self, url, **kwargs):
        logger.debug("GET %s" % url)
        url = self.absolute_url(url)
        kwargs = self._set_headers_kwargs(kwargs)
        return self.session.get(url, **kwargs)

    def post(self, url, **kwargs):
        url = self.absolute_url(url)
        kwargs = self._set_headers_kwargs(kwargs)

        data = kwargs['data']
        if 'csrfmiddlewaretoken' not in data:
            response = self.session.head(url)
            assert response.status_code == requests.codes.ok, "Failed to obtain CSRF token"
            csrftoken = response.cookies.get('csrftoken', '')
            data['csrfmiddlewaretoken'] = csrftoken
        kwargs['data'] = data

        logger.debug("POST %s (%s)" % (url, kwargs))
        return self.session.post(url, **kwargs)
