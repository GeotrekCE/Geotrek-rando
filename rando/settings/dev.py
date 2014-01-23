#!/usr/bin/env python
# -*- coding: utf8 -*-

from .base import *


GEOTREK_SERVER = 'geobi.makina-corpus.net/geotrek'
GEOTREK_USER = 'admin'
GEOTREK_PASSWORD = 'admin'

POPUP_HOME_ENABLED = True
PRINT_ENABLED = True
VIEW3D_ENABLED = True

DEBUG = True
TEMPLATE_DEBUG = DEBUG

CACHES = {
   'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
        'LOCATION': 'unique-snowflake'
    }
}
