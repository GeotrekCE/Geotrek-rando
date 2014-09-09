from rando.core.tests import NavigationTest


class BackpackNavigationTest(NavigationTest):

    def test_backpack(self):
        self.assertTrue(self.casper(self._get_tests_file('test_backpack.js')))
