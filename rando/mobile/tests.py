from django.test import SimpleTestCase

from .management.commands.build_mbtiles import format_from_url


class ImageExtensionGuessTest(SimpleTestCase):
    def test_can_guess_from_wmts(self):
        guessed = format_from_url('http://server/wmts?LAYER=GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN&EXCEPTIONS=text/xml&FORMAT=image/jpeg&SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX=9&TILEROW=185&TILECOL=268')
        self.assertEqual(guessed, 'image/jpeg')

    def test_can_guess_from_url(self):
        guessed = format_from_url('http://{s}.osm.org/tiles/{z}/{x}/{y}.png')
        self.assertEqual(guessed, 'png')
