from django.conf import settings as settings_

from rando import __version__
from rando.core.models import Settings


def settings(request):
    app_settings = Settings.objects.all()
    if not hasattr(app_settings, 'map') or not hasattr(app_settings, 'languages'):
        app_settings = dict(map=dict(extent=[-180, -90, 180, 90]),
                            languages=dict(default='fr'))

    lang = request.LANGUAGE_CODE
    return {
        'PREPROD': settings_.PREPROD,
        'VERSION': __version__,
        'TITLE': settings_.TITLE.get(lang, settings_.TITLE.get('en')),
        'DESCRIPTION': settings_.DESCRIPTION.get(lang, settings_.TITLE.get('en')),
        'URL': request.build_absolute_uri(request.path),
        'settings': app_settings,

        'SWITCH_DETAIL_ZOOM': settings_.SWITCH_DETAIL_ZOOM,

        'FOOTER_FILENAME': settings_.FOOTER_FILENAME,

        'POPUP_FILENAME': settings_.POPUP_FILENAME,
        'POPUP_HOME_ENABLED': settings_.POPUP_HOME_ENABLED,
        'POPUP_HOME_FORCED': settings_.POPUP_HOME_FORCED,

        'FILTERS_HASH_ENABLED': settings_.FILTERS_HASH_ENABLED,

        'FEEDBACK_FORM_ENABLED': settings_.FEEDBACK_FORM_ENABLED,

        'TOURISM_ENABLED': settings_.TOURISM_ENABLED,
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
