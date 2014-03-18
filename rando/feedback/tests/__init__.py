
import json
import os

from casper.tests import CasperTestCase

from django.conf import settings
from django.core import mail
from django.test import TestCase
from django.test.utils import override_settings

TESTS_DATA_PATH = os.path.join(os.path.dirname(__file__), 'data')


@override_settings(INPUT_DATA_ROOT=TESTS_DATA_PATH,
                   MEDIA_ROOT=os.path.join(TESTS_DATA_PATH, 'media'),
                   POPUP_HOME_ENABLED=False)
class FeedBackPickPlaceTests(CasperTestCase):

    def _get_tests_file(self, name):
        return os.path.join(settings.PROJECT_PATH, 'feedback', 'tests', name)

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

    def test_form_url(self):

        response = self.client.get(self.feedback_url)
        self.assertContains(response, 'name')
        self.assertContains(response, 'email')
        self.assertContains(response, 'category')
        self.assertContains(response, 'comment')
        self.assertContains(response, 'latitude')
        self.assertContains(response, 'longitude')

    def test_ajax_post_not_valid(self):

        form_data_nok = {'name': 'Patrick'}

        response = self.ajax_post(self.feedback_url, form_data_nok)

        result = json.loads(response.content)
        self.assertEquals(result['status'], 'NOK')
        self.assertIn('data', result.keys())

    def test_ajax_post_recaptcha_not_valid(self):

        form_data_nok = {
            'name': 'Patrick',
            'email': 'pat@makina.com',
            'category': u'SR',
        }

        response = self.ajax_post(self.feedback_url, form_data_nok)

        result = json.loads(response.content)
        self.assertEquals(result['status'], 'NOK')

    def test_ajax_post_valid(self):

        form_data_ok = {
            'name': 'Patrick',
            'email': 'pat@makina.com',
            'category': self.first_category[0],
            'comment': u'This is a comment',
            # This value 'PASSED' is a django-recaptcha default value
            # only usable in TEST env to validate form
            'recaptcha_response_field': 'PASSED',
        }

        response = self.ajax_post(self.feedback_url, form_data_ok)

        result = json.loads(response.content)
        self.assertEquals(result['status'], 'OK')


class FeedBackEmailSendingTests(FeedBackBaseTests):

    def test_sending_email(self):

        form_data_ok = {
            'name': u'Patrick',
            'email': u'pat@makina.com',
            'category': self.first_category[0],
            'comment': u'This is a comment',
            'latitude': 1.13,
            'longitude': 2.26,
            # This value 'PASSED' is a django-recaptcha default value
            # only usable in TEST env to validate form
            'recaptcha_response_field': 'PASSED',
        }

        # Sending feedback demand, which send a mail if form is OK
        response = self.ajax_post(self.feedback_url, form_data_ok)

        result = json.loads(response.content)
        self.assertEqual(result['status'], 'OK')

        # Checking that a mail has been sent
        self.assertEquals(len(mail.outbox), 1)
        sent_mail = mail.outbox[0]

        self.assertEquals(sent_mail.subject, u'Feedback from pat@makina.com')

        settings.FEEDBACK_FORM_CATEGORIES['en'][0][0]

        txt = u"Patrick has sent a feedback on category "
        txt += self.first_category[1]
        self.assertIn(txt, sent_mail.body)
        self.assertIn(u"Comment : This is a comment",
                      sent_mail.body)
        self.assertIn(u"Lat : 1.13 / Lon : 2.26",
                      sent_mail.body)
