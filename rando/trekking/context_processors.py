import logging

from django.conf import settings as settings_
from easydict import EasyDict as edict

from rando import __version__
from .models import Trek, Settings


logger = logging.getLogger(__name__)


def settings(request):
    lang = request.LANGUAGE_CODE

    app_settings = Settings.objects.all()
    if not hasattr(app_settings, 'map'):
        app_settings = dict(map=dict(extent=[-180, -90, 180, 90]))

    alltreks = Trek.objects.filter(language=lang).all()
    if not isinstance(alltreks, list):
        alltreks = []



    # Build list of distinct attributes
    allthemes = {}
    allusages = {}
    alldistricts = {}
    allcities = {}
    allroutes = {}
    for trek in alltreks:
        for district in trek.properties.districts:
            alldistricts[district.id] = district
        for city in trek.properties.cities:
            allcities[city.code] = city
        for usage in trek.properties.usages:
            allusages[usage.id] = usage
        for theme in trek.properties.themes:
            allthemes[theme.id] = theme
        route = trek.properties.route
        if route:
            allroutes[route.id] = route

    allthemes = sorted(allthemes.values(), key=lambda o: o.label)
    allusages = sorted(allusages.values(), key=lambda o: o.label)
    alldistricts = sorted(alldistricts.values(), key=lambda o: o.name)
    allcities = sorted(allcities.values(), key=lambda o: o.name)
    allroutes = sorted(allroutes.values(), key=lambda o: o.label)

    return {
        'VERSION': __version__,
        'TITLE': settings_.TITLE.get(lang, settings_.TITLE.get('en')),
        'DESCRIPTION': settings_.DESCRIPTION.get(lang, settings_.TITLE.get('en')),
        'settings' : app_settings,
         # We want the treks list to be initialized from everywhere
        'treksjson' : Trek.objects.filter(language=lang).content if alltreks else '{features: []}',
        # We need those to initialize filters
        'themes': allthemes,
        'usages': allusages,
        'districts': alldistricts,
        'cities': allcities,
        'routes': allroutes,
    }