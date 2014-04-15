import json
import os

from django.conf import settings
from django.core import mail
from django.core.mail.backends.base import BaseEmailBackend
from django.test import TestCase
from django.test.utils import override_settings

from rando.core.tests import NavigationTest


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

    def test_ajax_post_recaptcha_not_valid(self):
        form_data_nok = {
            'name': 'John Doe',
            'email': 'john.doe@nowhere.com',
            'category': u'SR',
        }

        response = self.ajax_post(self.feedback_url, form_data_nok)

        result = json.loads(response.content)
        self.assertEquals(result['status'], 'FORM_INVALID')

    def test_ajax_post_valid(self):
        form_data_ok = {
            'name': 'John Doe',
            'email': 'john.doe@nowhere.com',
            'category': self.first_category[0],
            'comment': u'This is a comment',
            # This value 'PASSED' is a django-recaptcha default value
            # only usable in TEST env to validate form
            'recaptcha_response_field': 'PASSED',
        }

        response = self.ajax_post(self.feedback_url, form_data_ok)

        result = json.loads(response.content)
        self.assertEquals(result['status'], 'EMAIL_SENDING_OK')


# This Email Backend is used to test error management when sending email
class FakeEmailBackend(BaseEmailBackend):

    def send_messages(self, email_messages):
        raise Exception('Fake problem')


class FeedBackEmailSendingTests(FeedBackBaseTests):

    def test_sending_email(self):
        form_data_ok = {
            'name': u'John Doe',
            'email': u'john.doe@nowhere.com',
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
        self.assertEqual(result['status'], 'EMAIL_SENDING_OK')

        # Checking that a mail has been sent
        self.assertEquals(len(mail.outbox), 1)
        sent_mail = mail.outbox[0]

        self.assertEquals(sent_mail.subject,
                          u'[Django] Feedback from John Doe')

        settings.FEEDBACK_FORM_CATEGORIES['en'][0][0]

        txt = (u"John Doe (john.doe@nowhere.com) has sent a feedback "
               "on category ")
        txt += self.first_category[1]
        self.assertIn(txt, sent_mail.body)
        self.assertIn(u"Comment : This is a comment",
                      sent_mail.body)
        self.assertIn(u"Lat : 1.13 / Lon : 2.26",
                      sent_mail.body)

    @override_settings(EMAIL_BACKEND='rando.feedback.tests.FakeEmailBackend')
    def test_problem_when_sending_email(self):
        form_data_ok = {
            'name': 'John Doe',
            'email': 'john.doe@nowhere.com',
            'category': self.first_category[0],
            'comment': u'This is a comment',
            # This value 'PASSED' is a django-recaptcha default value
            # only usable in TEST env to validate form
            'recaptcha_response_field': 'PASSED',
        }

        response = self.ajax_post(self.feedback_url, form_data_ok)

        result = json.loads(response.content)
        self.assertEquals(result['status'], 'EMAIL_SENDING_FAILED')
