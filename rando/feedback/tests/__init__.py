
from django.test import TestCase


class FeedBackFormValidationTests(TestCase):

    def setUp(self):

        self.feedback_url = '/fr/feedback/'

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

        response = self.client.post(self.feedback_url, form_data_nok,
                                    HTTP_X_REQUESTED_WITH="XMLHttpRequest")
        self.assertContains(response, 'status')
        self.assertContains(response, 'NOK')
        self.assertContains(response, 'data')

    def test_ajax_post_valid(self):

        form_data_ok = {'name': 'Patrick', 'email': 'pat@makina.com'}

        response = self.client.post(self.feedback_url, form_data_ok,
                                    HTTP_X_REQUESTED_WITH="XMLHttpRequest")
        self.assertContains(response, 'status')
        self.assertContains(response, 'OK')
