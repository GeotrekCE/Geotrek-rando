import shutil
import os

from mock import patch

from django.test import SimpleTestCase
from django.conf import settings


from .templatetags.trekking_tags import overridable
from .management.commands.sync_trekking import mkdir_p


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
        original = "img/favicon.png"
        overridden = overridable(original)
        self.assertEqual(overridden, "%s%s" % (settings.STATIC_URL, original))

    def test_return_(self):
        original = "img/favicon.png"
        with patch.object(os.path, 'exists') as mock_method:
            mock_method.return_value = True
            overridden = overridable(original)
        self.assertEqual(overridden, "%s%s" % (settings.MEDIA_URL, original))