import shutil
import os

from django.test import SimpleTestCase

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
