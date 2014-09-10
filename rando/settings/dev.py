#!/usr/bin/env python
# -*- coding: utf8 -*-

from .base import *


GEOTREK_SERVER = 'prod-geotrek-fr.makina-corpus.net'
GEOTREK_USER = 'admin'
GEOTREK_PASSWORD = 'admin'

FEEDBACK_FORM_ENABLED = True
POPUP_HOME_ENABLED = True
PRINT_ENABLED = True

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
