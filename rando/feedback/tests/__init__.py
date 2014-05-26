import mock
import json
import os

from django.conf import settings
from django.test import TestCase
from django.test.utils import override_settings

from rando.core.tests import NavigationTest
from rando.feedback.helpers import send_report


@override_settings(POPUP_HOME_ENABLED=False,
                   FEEDBACK_FORM_ENABLED=True)
class FeedBackPickPlaceTests(NavigationTest):

    def test_popup(self):
        self.assertTrue(self.casper(self._get_tests_file('test_pickplace.js')))


class FeedBackBaseTests(TestCase):

    def setUp(self):
        self.feedback_url = '/en/feedback/'

        self.first_category = settings.FEEDBACK_FORM_CATEGORIES['en'][0]

        # This env variable must be used for form validation
        # We just have to put "recaptcha_response_field" field to 'PASSED'
        # to validate feedback form
        os.environ['RECAPTCHA_TESTING'] = 'True'

    def ajax_post(self, url, data, **kwargs):
        kwargs['HTTP_X_REQUESTED_WITH'] = "XMLHttpRequest"

        return self.client.post(url, data, **kwargs)

    def tearDown(self):
        os.environ.pop('RECAPTCHA_TESTING', None)


class FeedBackFormValidationTests(FeedBackBaseTests):

    def setUp(self):
        super(FeedBackFormValidationTests, self).setUp()
        self.form_data_ok = {
            'name': 'John Doe',
            'email': 'john.doe@nowhere.com',
            'category': self.first_category[0],
            'comment': u'This is a comment',
            # This value 'PASSED' is a django-recaptcha default value
            # only usable in TEST env to validate form
            'recaptcha_response_field': 'PASSED',
        }

    def test_form_url(self):
        response = self.client.get(self.feedback_url)
        self.assertContains(response, 'name')
        self.assertContains(response, 'email')
        self.assertContains(response, 'category')
        self.assertContains(response, 'comment')
        self.assertContains(response, 'latitude')
        self.assertContains(response, 'longitude')

    def test_ajax_post_not_valid(self):
        form_data_nok = {'name': 'John Doe'}

        response = self.ajax_post(self.feedback_url, form_data_nok)

        result = json.loads(response.content)
        self.assertEquals(result['status'], 'FORM_INVALID')
        self.assertIn('data', result.keys())

    @mock.patch('rando.feedback.helpers.send_report')
    def test_ajax_post_recaptcha_not_valid(self, send_report):
        form_data_nok = dict(**self.form_data_ok)
        form_data_nok['recaptcha_response_field'] = 'WRONG'

        response = self.ajax_post(self.feedback_url, form_data_nok)

        result = json.loads(response.content)
        self.assertEquals(result['status'], 'FORM_INVALID')
        self.assertFalse(send_report.called)

    @mock.patch('rando.feedback.helpers.send_report')
    def test_ajax_post_valid(self, send_report):
        response = self.ajax_post(self.feedback_url, self.form_data_ok)

        result = json.loads(response.content)
        self.assertEquals(result['status'], 'REPORT_OK')
        self.assertTrue(send_report.called)

    @mock.patch('rando.feedback.helpers.send_report')
    def test_ajax_post_valid_send_fails(self, send_report):
        send_report.side_effect = Exception('Boom!')
        response = self.ajax_post(self.feedback_url, self.form_data_ok)
        result = json.loads(response.content)
        self.assertEquals(result['status'], 'REPORT_FAILED')


class SendReportTestCase(TestCase):
    @mock.patch('rando.feedback.helpers.requests.get')
    def test_a_login_is_performed_on_geotrek(self, requests_get):
        send_report({})
        requests_get.assert_called_with(settings.GEOTREK_SERVER)