from django import template
from django.conf import settings
from django.utils.translation import ugettext_lazy as _

from rando.trekking import models as trekking_models


register = template.Library()


@register.inclusion_tag("trekking/_filters.html", takes_context=True)
def trekking_filters(context):
    request = context['request']

    lang = request.LANGUAGE_CODE
    alltreks = trekking_models.Trek.objects.filter(language=lang).all()

    duration_levels = []
    for (label, duration) in settings.FILTER_DURATION_VALUES:
        duration_levels.append({'label': _(label), 'value': duration})

    altitude_levels = []
    for i, ascent in enumerate(settings.FILTER_ASCENT_VALUES):
        if i == 0:
            label = _('< %sm') % ascent
        elif i == len(settings.FILTER_ASCENT_VALUES) -1:
            label = _('> %sm') % ascent
        else:
            label = _('%sm') % ascent
        altitude_levels.append({'label': label, 'value': ascent})

    all_difficulties = {}
    for trek in alltreks:
        if not trek.difficulty:
            continue
        did = trek.difficulty.id
        dlabel = trek.difficulty.label
        all_difficulties[did] = {'label': dlabel, 'value': did}

    difficulty_levels = sorted(all_difficulties.values(),
                               key=lambda d: d['value'])

    context['difficulty_levels'] = difficulty_levels
    context['duration_levels'] = duration_levels
    context['altitude_levels'] = altitude_levels

    # Build list of distinct attributes
    allthemes = {}
    allusages = {}
    alldistricts = {}
    allcities = {}
    allroutes = {}
    for trek in alltreks:
        for district in trek.districts:
            alldistricts[district.id] = district
        for city in trek.cities:
            allcities[city.code] = city
        for usage in trek.usages:
            allusages[usage.id] = usage
        for theme in trek.themes:
            allthemes[theme.id] = theme
        route = trek.route
        if route:
            allroutes[route.id] = route

    allthemes = sorted(allthemes.values(), key=lambda o: o.label)
    allusages = sorted(allusages.values(), key=lambda o: o.label)
    alldistricts = sorted(alldistricts.values(), key=lambda o: o.name)
    allcities = sorted(allcities.values(), key=lambda o: o.name)
    allroutes = sorted(allroutes.values(), key=lambda o: o.label)

    context.update({
        'themes': allthemes,
        'usages': allusages,
        'districts': alldistricts,
        'cities': allcities,
        'routes': allroutes,
    })

    return context
