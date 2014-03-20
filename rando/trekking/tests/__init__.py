# -*- coding: utf-8 -*-
import shutil
import os
import re

from mock import patch
from easydict import EasyDict as edict
from casper.tests import CasperTestCase

from django.test import SimpleTestCase
from django.test.utils import override_settings
from django.conf import settings

from rando.trekking.templatetags.trekking_tags import overridable
from rando.trekking.management.commands.sync_trekking import (mkdir_p,
    reroot)
from rando.trekking.models import Trek, JSONManager


TESTS_DATA_PATH = os.path.join(settings.PROJECT_PATH, 'tests', 'data')


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


class JSONManagerTest(SimpleTestCase):
    def test_manager_returns_empty_list_if_file_empty(self):
        mgr = JSONManager()
        with patch('rando.trekking.models.JSONManager') as mock_content:
            mock_content.content.return_value = '[]'
            self.assertEqual([], mgr.all())


class TrekFulltextTest(SimpleTestCase):

    def setUp(self):
        self.trek = Trek()
        self.trek.properties = edict({
            'name': 'its name',
            'departure': 'd&eacute;part',
            'arrival': 'made in a z small world',
            'ambiance': "it's like like like, you know. VERY good.",
            'advice': """do not take
            this way""",
            'cities': [edict({'name': 'triffouilli', 'code': '12345'})],
            'districts': [edict({'name': 'secteur'})],
            'pois': [edict({'name': 'jonquille', 'description': 'desc', 'type': 'fleur'})],
        })
        self.fulltext = self.trek.fulltext

    def test_fulltext_is_transformed_to_lower_case(self):
        self.assertFalse('VERY' in self.fulltext)
        self.assertTrue('very' in self.fulltext)

    def test_fulltext_html_entities_are_rendered(self):
        self.assertTrue(u'é' in self.fulltext)

    def test_fulltext_contains_cities(self):
        self.assertTrue('triffouilli' in self.fulltext)
        self.assertTrue('12345' in self.fulltext)

    def test_fulltext_contains_districts(self):
        self.assertTrue('secteur' in self.fulltext)

    def test_fulltext_contains_pois(self):
        self.assertTrue('jonquille' in self.fulltext)
        self.assertTrue('desc' in self.fulltext)
        self.assertTrue('fleur' in self.fulltext)

    def test_small_words_and_ponctuation_are_removed(self):
        self.assertFalse(' ' in self.fulltext)
        self.assertFalse("\n" in self.fulltext)
        self.assertFalse('.' in self.fulltext)
        self.assertFalse(',' in self.fulltext)
        self.assertFalse("'" in self.fulltext)
        self.assertFalse('not' in self.fulltext)
        self.assertFalse('in' in self.fulltext)
        self.assertFalse('you' in self.fulltext)
        self.assertFalse('z' in self.fulltext)

    def test_duplicate_words_are_removed(self):
        count = len(list(re.finditer('like', self.fulltext)))
        self.assertEqual(count, 1)


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
        return os.path.join(settings.PROJECT_PATH, 'trekking', 'tests', name)

    def test_popup(self):
        self.assertTrue(self.casper(self._get_tests_file('test_popup.js')))

    def test_backpack(self):
        self.assertTrue(self.casper(self._get_tests_file('test_backpack.js')))

    def test_filters_difficulty(self):
        self.assertTrue(self.casper(self._get_tests_file('test_filters_difficulty.js')))

    def test_filters_duration(self):
        self.assertTrue(self.casper(self._get_tests_file('test_filters_duration.js')))

    def test_filters_altitude(self):
        self.assertTrue(self.casper(self._get_tests_file('test_filters_altitude.js')))

    def test_filters_hash(self):
        self.assertTrue(self.casper(self._get_tests_file('test_filters_hash.js')))

    def test_view3d(self):
        self.assertTrue(self.casper(self._get_tests_file('test_view3d.js')))
