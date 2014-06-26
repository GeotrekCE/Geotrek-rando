from django.test.utils import override_settings

from rando.core.tests import NavigationTest


@override_settings(VIEW3D_ENABLED=True)
class View3DNavigationTest(NavigationTest):
    def test_view3d(self):
        self.assertTrue(self.casper(self._get_tests_file('test_view3d.js')))
