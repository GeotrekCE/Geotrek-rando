import os
import re

from django.conf import settings
from django.core.management.base import BaseCommand
from landez import MBTilesBuilder

from rando import logger
from rando.core.models import Settings
from rando.trekking.models import Trek
from rando.mobile import mobile_settings


def build_mbtiles_along_coords(filepath, coords, builder_args):
    """ For each point of the specified coordinates, it covers an area
    with a small radius on high zoom levels, and large radius on lower zoom
    levels.
    """
    def _radius2bbox(lng, lat, radius):
        return (lng - radius, lat - radius,
                lng + radius, lat + radius)

    mbtiles = MBTilesBuilder(filepath=filepath, **builder_args)

    for (lng, lat) in coords:
        large = _radius2bbox(lng, lat, mobile_settings.MBTILES_RADIUS_LARGE)
        small = _radius2bbox(lng, lat, mobile_settings.MBTILES_RADIUS_SMALL)
        mbtiles.add_coverage(bbox=large, zoomlevels=mobile_settings.MBTILES_LOW_ZOOMS)
        mbtiles.add_coverage(bbox=small, zoomlevels=mobile_settings.MBTILES_HIGH_ZOOMS)

    mbtiles.run()


def format_from_url(url):
    """
    Try to guess the tile mime type from the tiles URL.
    Should work with basic stuff like `http://osm.org/{z}/{x}/{y}.png`
    or funky stuff like WMTS (`http://server/wmts?LAYER=...FORMAT=image/jpeg...)
    """
    m = re.search(r'FORMAT=([a-zA-Z/]+)&', url)
    if m:
        return m.group(1)
    return url.rsplit('.')[-1]


def remove_file(path):
    try:
        os.remove(path)
    except OSError:
        pass


class Command(BaseCommand):
    help = "Build MBTiles files for each trek"

    def execute(self, *args, **options):

        self.site_url = args[0] if len(args) > 0 else ''

        self.output_folder = os.path.join(settings.INPUT_DATA_ROOT, 'tiles')
        if not os.path.exists(self.output_folder):
            os.makedirs(self.output_folder)

        tiles_url = None
        for tiles_layer in settings.LEAFLET_CONFIG['TILES']:
            if tiles_layer[0] == 'detail':
                tiles_url = tiles_layer[1]
        logger.info("Tiles URL is %s" % tiles_url)

        self.builder_args = {
            'tiles_url': tiles_url,
            'tile_format': format_from_url(tiles_url),
            'tiles_headers': {"Referer": self.site_url}
        }

        self._build_global_mbtiles()

        for trek in Trek.objects.filter(language=settings.LANGUAGE_CODE).all():
            self._build_trek_mbtiles(trek)

        logger.info('Done.')

    def _build_global_mbtiles(self):
        """ Creates a MBTiles on the global extent.
        Builds a temporary file and overwrites the existing one on success.
        """
        server_settings = Settings.objects.all()
        global_extent = server_settings.map.extent

        logger.info("Global extent is %s" % global_extent)
        global_file = os.path.join(self.output_folder, 'global.mbtiles')
        tmp_gobal_file = global_file + '.tmp'

        logger.info("Build global MBTiles...")
        mbtiles = MBTilesBuilder(filepath=tmp_gobal_file, **self.builder_args)
        mbtiles.add_coverage(bbox=global_extent,
                             zoomlevels=mobile_settings.MBTILES_GLOBAL_ZOOMS)
        mbtiles.run()

        remove_file(global_file)
        os.rename(tmp_gobal_file, global_file)
        logger.info('%s done.' % global_file)

    def _build_trek_mbtiles(self, trek):
        """ Creates a MBTiles for the specified Trek object.
        Builds a temporary file and overwrites the existing one on success.
        """
        logger.info("Build MBTiles for trek '%s'..." % trek.properties.name)
        trek_file = os.path.join(self.output_folder, 'trek-%s.mbtiles' % trek.id)
        tmp_trek_file = trek_file + '.tmp'

        coords = trek.geometry.coordinates
        build_mbtiles_along_coords(tmp_trek_file, coords, self.builder_args)

        remove_file(trek_file)
        os.rename(tmp_trek_file, trek_file)
        logger.info('%s done.' % trek_file)
