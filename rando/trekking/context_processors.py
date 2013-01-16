from .models import Trek, Settings
from easydict import EasyDict as edict


def settings(request):
    lang = request.LANGUAGE_CODE

    # Build list of distinct attributes
    allthemes = {}
    allusages = {}
    alldistricts = {}
    allcities = {}
    for trek in Trek.objects.filter(language=lang).all():
        for district in trek.properties.districts:
            alldistricts[district.id] = district
        for city in trek.properties.cities:
            allcities[city.code] = city
        for usage in trek.properties.usages:
            allusages[usage.id] = usage
        for theme in trek.properties.themes:
            allthemes[theme.id] = theme
    allthemes = sorted(allthemes.values(), key=lambda o: o.label)
    allusages = sorted(allusages.values(), key=lambda o: o.label)
    alldistricts = sorted(alldistricts.values(), key=lambda o: o.name)
    allcities = sorted(allcities.values(), key=lambda o: o.name)

    return {
        'settings' : Settings.objects.all(),
         # We want the treks list to be initialized from everywhere
        'treksjson' : Trek.objects.filter(language=lang).content,
        # We need those to initialize filters
        'themes': allthemes,
        'usages': allusages,
        'districts': alldistricts,
        'cities': allcities,
    }