import requests
from urlparse import urlparse
from os.path import join

from django.conf import settings

from rando import __version__


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

    def login(self):
        self.session = requests.Session()

        login_url = join(self.server, settings.GEOTREK_LOGIN_URL)
        response = self.session.get(login_url)
        csrftoken = response.cookies.get('csrftoken', '')
        response = self.session.post(login_url,
                                     {'username': settings.GEOTREK_USER,
                                      'password': settings.GEOTREK_PASSWORD,
                                      'csrfmiddlewaretoken': csrftoken},
                                     allow_redirects=False)
        assert response.status_code == 302, "Failed to login on API with current settings"

    def absolute_url(self, url):
        """
        Joins the Geotrek server url with the specified url. Tricky in the case
        the Geotrek admin serves the application on a subfolder (e.g. /geotrek).
        """
        url = url.replace(self.rooturl, '')
        return join(self.server, url)

    def get(self, url, **kwargs):
        url = self.absolute_url(url)

        headers = kwargs.get('headers', {})
        if 'User-Agent' not in headers:
            headers.update({'User-Agent': 'geotrek-rando/%s' % __version__})
        kwargs['headers'] = headers

        return self.session.get(url, **kwargs)

    def post(self, url, **kwargs):
        pass
