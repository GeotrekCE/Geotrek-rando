# -*- coding: utf-8 -*-
import os
import re

from mock import patch
from easydict import EasyDict as edict
from django.test import SimpleTestCase
from django.conf import settings

from rando.core.tests import NavigationTest
from rando.trekking.models import Trek


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


class TrekkingNavigationTest(NavigationTest):
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
