from django.conf import settings
from easydict import EasyDict as edict


MOBILE_CONFIG = getattr(settings, 'MOBILE_CONFIG', {})

mobile_settings = edict({
    'MBTILES_RADIUS_LARGE': 0.01,  # ~1 km
    'MBTILES_RADIUS_SMALL': 0.05,  # ~500 m
    'MBTILES_GLOBAL_ZOOMS': range(13),
    'MBTILES_LOW_ZOOMS': range(13, 15),
    'MBTILES_HIGH_ZOOMS': range(15, 17),
}, **MOBILE_CONFIG)
