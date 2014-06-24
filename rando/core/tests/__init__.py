import shutil
import os
import sys

from mock import patch

from casper.tests import CasperTestCase

from django.test import TestCase, SimpleTestCase
from django.test.utils import override_settings
from django.conf import settings

from rando.core.templatetags.rando_tags import overridable
from rando.core.management.commands.sync_content import (mkdir_p, reroot)
from rando.core.models import JSONManager
from rando.core.utils import locale_redirect


TESTS_DATA_PATH = os.path.join(settings.PROJECT_PATH, 'core', 'tests', 'data')


class MkdirTest(SimpleTestCase):

    path = 'toto/tata/titi'

    def test_create_new(self):

        mkdir_p(self.path)
        self.assertTrue(os.path.isdir(self.path))

    def test_create_existing(self):

        path = 'toto/tata/titi'
        mkdir_p(path)
        self.assertTrue(os.path.isdir(self.path))

    def test_remove(self):

        shutil.rmtree(self.path.split('/', 1)[0])


class RerootTest(SimpleTestCase):
    def test_reroot_of_simple_value(self):
        rerooted = reroot('/geotrek/media/api/poi.geojson')
        self.assertEqual(rerooted, '/media/api/poi.geojson')

    def test_reroot_of_a_list(self):
        rerooted = reroot(['/geotrek/media/api/poi.geojson',
                           '/geotrek/media/api/layer.geojson'])
        self.assertEqual(rerooted, ['/media/api/poi.geojson',
                                    '/media/api/layer.geojson'])

    def test_reroot_of_a_dict_entry(self):
        obj = dict(url='/geotrek/media/api/poi.geojson')
        obj = reroot(obj, attr='url')
        self.assertEqual(obj['url'], '/media/api/poi.geojson')

    def test_reroot_of_a_dict_entry_of_a_list(self):
        objs = [dict(path='/geotrek/media/api/poi.geojson'),
                dict(path='/geotrek/media/api/layer.geojson')]
        objs = reroot(objs, attr='path')
        self.assertEqual(objs, [{'path': '/media/api/poi.geojson'},
                                {'path': '/media/api/layer.geojson'}])

    def test_reroot_does_not_alter_if_not_starting_with_media(self):
        notrerooted = reroot('/geotrek/api/poi.geojson')
        self.assertEqual(notrerooted, '/geotrek/api/poi.geojson')


class JSONManagerTest(SimpleTestCase):
    def test_manager_returns_empty_list_if_file_empty(self):
        mgr = JSONManager()
        with patch('rando.core.models.JSONManager') as mock_content:
            mock_content.content.return_value = '[]'
            self.assertEqual([], mgr.all())


class UtilsTest(SimpleTestCase):
    def test_redirect_with_locale(self):
        response = locale_redirect('core:fileserve',
                                   kwargs={'path': '/file.pdf'},
                                   locale='it')
        self.assertEqual(response['location'], '/it/files/file.pdf')


@override_settings(INPUT_DATA_ROOT=TESTS_DATA_PATH)
class CoreViewsTest(TestCase):
    def test_fileserve_serves_geojson_as_json(self):
        response = self.client.get('/fr/files/api/trek/trek.geojson')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'application/json')

    def test_fileserve_serves_gpx_as_xml(self):
        response = self.client.get('/fr/files/api/trek/trek-2.kml')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'],
                         'application/vnd.google-earth.kml+xml')

    def test_fileserve_serves_kml_as_googleearth(self):
        response = self.client.get('/fr/files/api/trek/trek-2.gpx')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'application/gpx+xml')


@override_settings(INPUT_DATA_ROOT=TESTS_DATA_PATH,
                   MEDIA_ROOT=os.path.join(TESTS_DATA_PATH, 'media'))
class NavigationTest(CasperTestCase):
    no_colors = False

    def setUp(self):
        # Make sure there is no persistent localstorage
        try:
            phantom_localstorage = os.path.join(os.path.expanduser('~'),
                                                '.qws', 'share', 'data',
                                                'Ofi Labs', 'PhantomJS',
                                                'http_localhost_8081.localstorage')
            os.remove(phantom_localstorage)
        except OSError:
            pass

    def _get_tests_file(self, name):
        here = os.path.dirname(sys.modules[self.__class__.__module__].__file__)
        return os.path.join(here, name)


class RandoNavigationTest(NavigationTest):
    def test_popup_home(self):
        self.assertTrue(self.casper(self._get_tests_file('test_popup_home.js')))

    @override_settings(POPUP_HOME_FORCED=True)
    def test_popup_home_forced(self):
        self.assertTrue(self.casper(self._get_tests_file('test_popup_home_forced.js')))

class OverridableStaticTest(SimpleTestCase):
    def test_return_static_if_missing(self):
        original = "img/decoration.png"
        overridden = overridable(original)
        self.assertEqual(overridden, "%s%s" % (settings.STATIC_URL, original))

    def test_return_(self):
        original = "img/decoration.png"
        with patch.object(os.path, 'exists') as mock_method:
            mock_method.return_value = True
            overridden = overridable(original)
        self.assertEqual(overridden, "%s%s" % (settings.MEDIA_URL, original))
