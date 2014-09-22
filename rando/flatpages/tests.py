# -*- coding: utf8 -*-
import mock
import json
import os

from django.test import TestCase
from django.test.utils import override_settings

from rando.core.tests import TESTS_DATA_PATH
from rando.flatpages.models import FlatPage
from rando.flatpages.templatetags.flatpages_tags import get_flatpages


TESTS_PAGES_PATH = os.path.join(TESTS_DATA_PATH, 'media', 'pages')


@override_settings(FLATPAGES_ROOT=TESTS_PAGES_PATH)
class FlatPagesJSONTest(TestCase):

    def setUp(self):
        self.path = 'api/pages/pages.json'

        self.response = self.client.get('/fr/files/' + self.path)
        results = json.loads(self.response.content)
        self.first = results[0]

    def test_url_is_like_other_synced_resources(self):
        self.assertFalse(os.path.exists(os.path.join(TESTS_DATA_PATH, self.path)))
        self.assertEqual(self.response.status_code, 200)
        self.assertEqual(self.response['Content-Type'], 'application/json')

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

    @override_settings(FLATPAGES_TARGETS={'a-title': 'mobile'})
    def test_flatpages_targets_can_be_controlled_via_setting(self):
        page = FlatPage(title='a-title')
        self.assertEqual(page.target, 'mobile')

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
