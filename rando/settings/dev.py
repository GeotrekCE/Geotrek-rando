#!/usr/bin/env python
# -*- coding: utf8 -*-

from .base import *


GEOTREK_SERVER = 'geobi.makina-corpus.net/geotrek'
GEOTREK_USER = 'admin'
GEOTREK_PASSWORD = 'admin'

POPUP_HOME_ENABLED = True
PRINT_ENABLED = True
VIEW3D_ENABLED = True
FEEDBACK_FORM_ENABLED = True

DEBUG = True
TEMPLATE_DEBUG = DEBUG

CACHES = {
   'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
        'LOCATION': 'unique-snowflake'
    }
}

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

RECAPTCHA_PUBLIC_KEY = '6Ldrbu4SAAAAALJ0NMX0LBK-UAE8u5wJT5zrb5Uo'
RECAPTCHA_PRIVATE_KEY = '6Ldrbu4SAAAAAPbt5g3Vw2BA_LGL1-BZwaBSsnfz'

FEEDBACK_FORM_CATEGORIES = {
    'en': (('obs', u'Obstacle'),
           ('sign', u'Sign'),
           ('markers', u'Markers'),
           ('other', u'Other')),
    'fr': (('obs', u'Obstacle'),
           ('sign', u'Signalétique'),
           ('markers', u'Marquage'),
           ('other', u'Autre')),
}
