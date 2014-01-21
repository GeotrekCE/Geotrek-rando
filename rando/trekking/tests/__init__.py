# -*- coding: utf-8 -*-
import shutil
import os
import re

from mock import patch
from easydict import EasyDict as edict
from casper.tests import CasperTestCase

from django.test import SimpleTestCase
from django.conf import settings


from rando.trekking.templatetags.trekking_tags import overridable
from rando.trekking.management.commands.sync_trekking import mkdir_p
from rando.trekking.models import Trek


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


class NavigationTest(CasperTestCase):
    def _get_tests_file(self, name):
        return os.path.join(settings.PROJECT_PATH, 'trekking', 'tests', name)

    def test_popup(self):
        with self.settings(POPUP_HOME_ENABLED=True):
            self.assertTrue(self.casper(self._get_tests_file('test_popup.js')))
