#!/usr/bin/env python
{% set cfg = salt['mc_utils.json_load'](data) %}
{% set data = cfg.data %}
import json
from .base import *

SERVER_EMAIL = DEFAULT_FROM_EMAIL ='root@{{cfg.fqdn}}'

{% macro renderbool(opt)%}
{{opt}} = {%if data.get(opt, False)%}True{%else%}False{%endif%}
{% endmacro %}

LANGUAGE_CODE = '{{data.LANGUAGE_CODE}}'
TITLE = {
    'en': "Trekking",
    'fr': "Portail rando",
}

DESCRIPTION = {
    'en': "Catalog of treks",
    'fr': "Offre rando",
}
{{renderbool('DEBUG') }}
ADMINS = (
    {% for dadmins in data.admins %}
    {% for admin, data in dadmins.items() %}
    ('{{admin}}', '{{data.mail}}'),
    {% endfor %}
    {% endfor %}
)
GEOTREK_SERVER = '{{data.GEOTREK_SERVER}}'
GEOTREK_USER = '{{data.GEOTREK_USER}}'
GEOTREK_PASSWORD = '{{data.GEOTREK_PASSWORD}}'
GANALYTICS_TRACKING_CODE = '{{data.GANALYTICS_TRACKING_CODE}}'
{{ renderbool('POPUP_HOME_ENABLED') }}
{{ renderbool('PRINT_ENABLED') }}
{{ renderbool('VIEW3D_ENABLED') }}

# Feedback app config
{{ renderbool('FEEDBACK_FORM_ENABLED') }}
RECAPTCHA_PUBLIC_KEY = '{{data.RECAPTCHA_PUBLIC_KEY}}'
RECAPTCHA_PRIVATE_KEY = '{{data.RECAPTCHA_PRIVATE_KEY}}'

# Filters customization
FILTER_ASCENT_VALUES = {{data.FILTER_ASCENT_VALUES}}

# Flat pages customizations
FLATPAGES_POLICY_PAGE = {{data.FLATPAGES_POLICY_PAGE}}

# Layers customizations
LEAFLET_CONFIG = {{data.LEAFLET_CONFIG}}

# Tourism Layers
{{renderbool('TOURISM_ENABLED')}}

# In preprod
{{renderbool('PREPROD')}}
# vim:set et sts=4 ts=4 tw=80:
