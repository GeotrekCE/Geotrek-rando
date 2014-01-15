from django.conf import settings as settings_

from rando import __version__
from rando.trekking.models import Settings


def settings(request):
    app_settings = Settings.objects.all()
    if not hasattr(app_settings, 'map'):
        app_settings = dict(map=dict(extent=[-180, -90, 180, 90]))
    lang = request.LANGUAGE_CODE
    return {
        'PREPROD': settings_.PREPROD,
        'VERSION': __version__,
        'TITLE': settings_.TITLE.get(lang, settings_.TITLE.get('en')),
        'DESCRIPTION': settings_.DESCRIPTION.get(lang, settings_.TITLE.get('en')),
        'URL': request.build_absolute_uri(request.path),
        'FLATPAGES_POLICY_PAGE': settings_.FLATPAGES_POLICY_PAGE,
        'POPUP_HOME_ENABLED': settings_.POPUP_HOME_ENABLED,
        'POPUP_FILENAME': settings_.POPUP_FILENAME,
        'FOOTER_FILENAME': settings_.FOOTER_FILENAME,
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
