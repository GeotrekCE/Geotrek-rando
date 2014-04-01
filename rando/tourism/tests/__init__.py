from django.test.utils import override_settings

from rando.core.tests import NavigationTest


@override_settings(POPUP_HOME_ENABLED=False)
class TourismLayersTests(NavigationTest):

    def test_popup(self):
        self.assertTrue(self.casper(self._get_tests_file('test_tourism_layers.js')))
