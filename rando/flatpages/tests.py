# -*- coding: utf8 -*-
import mock
import json
import os

from django.test import TestCase
from django.test.utils import override_settings

from rando.core.tests import TESTS_DATA_PATH
from rando.flatpages.models import FlatPage, FlatPageManager


TESTS_PAGES_PATH = os.path.join(TESTS_DATA_PATH, 'media', 'pages')


@override_settings(FLATPAGES_ROOT=TESTS_PAGES_PATH)
class FlatPagesJSONTest(TestCase):

    def setUp(self):
        self.json = FlatPage.objects.filter(language='fr').json
        results = json.loads(self.json)
        self.first = results[0]

    def test_pages_properties_are_exposed(self):
        self.assertEqual(self.first['title'], 'Fake page')
        self.assertEqual(self.first['slug'], 'fake-page')
        self.assertEqual(self.first['target'], 'all')
        self.assertIsNotNone(self.first.get('last_modified'))
        self.assertIsNotNone(self.first.get('media'))
        self.assertEqual(self.first['url'], '/fr/pages/fake-page')


class TemplateTagTest(TestCase):
    @override_settings(FLATPAGES_TARGETS={'a-title': 'mobile'})
    @mock.patch('rando.flatpages.models.FlatPageManager.all')
    def test_targets_all_and_rando_are_shown_navigation(self, list_mock):
        list_mock.return_value = [FlatPage(title='a-title'),
                                  FlatPage(title='another-title')]
        response = self.client.get('/fr/')
        self.assertNotContains(response, 'a-title')
        self.assertContains(response, 'another-title')


class FlatPagesTest(TestCase):
    def test_flatpages_have_a_target_default_to_all(self):
        page = FlatPage()
        self.assertEqual(page.target, 'all')

    @override_settings(FLATPAGES_TARGETS={'a-title': 'mobile'},
                       FLATPAGES_TITLES={'a-title': 'A title'})
    def test_flatpages_targets_can_be_controlled_via_setting(self):
        page = FlatPage(title='a-title')
        self.assertEqual(page.target, 'mobile')

    @override_settings(FLATPAGES_TITLES={'a-title': 'A title'})
    def test_flatpages_titles_can_be_controlled_via_setting(self):
        result = FlatPageManager.parse_filename('001-a-title.html', 2)
        self.assertEqual(result, (1, 'a-title'))

        result = FlatPageManager.parse_filename('page.html', 2)
        self.assertEqual(result, (2, 'page'))

        result = FlatPageManager.parse_filename('001.html', 2)
        self.assertEqual(result, (2, '001'))

    def test_media_is_empty_if_content_is_none(self):
        page = FlatPage()
        self.assertEqual(page.parse_media(), [])

    def test_media_is_empty_if_content_has_no_image(self):
        page = FlatPage(content="""<h1>One page</h1><body>One looove</body>""")
        self.assertEqual(page.parse_media(), [])

    def test_media_returns_all_images_attributes(self):
        html = u"""
        <h1>One page</h1>
        <body><p>Yéâh</p>
        <img src="/media/image1.png" title="Image 1" alt="image-1"/>
        <img src="/media/image2.jpg"/>
        <img title="No src"/>
        </body>
        """
        page = FlatPage(content=html)
        self.assertEqual(page.parse_media(), [
            {'url': '/media/image1.png', 'title': 'Image 1', 'alt': 'image-1', 'mimetype': ['image', 'png']},
            {'url': '/media/image2.jpg', 'title': '', 'alt': '', 'mimetype': ['image', 'jpeg']}
        ])

    def test_flatpages_is_a_link(self):
        html = u"http://www.makina-corpus.com"
        page = FlatPage(content=html)
        self.assertEqual(page.link, 'http://www.makina-corpus.com')
