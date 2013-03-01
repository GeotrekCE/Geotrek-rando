import logging

from django.conf import settings as settings_
from easydict import EasyDict as edict

from rando import __version__
from rando.trekking.models import Settings


logger = logging.getLogger(__name__)


def settings(request):
    app_settings = Settings.objects.all()
    if not hasattr(app_settings, 'map'):
        app_settings = dict(map=dict(extent=[-180, -90, 180, 90]))
    lang = request.LANGUAGE_CODE
    return {
        'VERSION': __version__,
        'TITLE': settings_.TITLE.get(lang, settings_.TITLE.get('en')),
        'DESCRIPTION': settings_.DESCRIPTION.get(lang, settings_.TITLE.get('en')),
        'URL': request.build_absolute_uri(request.path),
        'settings' : app_settings,
    }


def pjax(request):
    return {
         # We need this to put <title> in DOM
        'pjax': request.META.get('HTTP_X_PJAX', False),
    }


def donottrack(request):
    return {
        'donottrack': request.META.get('HTTP_DNT') == '1'
    }
