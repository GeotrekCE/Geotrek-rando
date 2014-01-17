import os

from django import template
from django.conf import settings
from django.templatetags.static import static
from django.utils.safestring import mark_safe
from django.utils.translation import ugettext_lazy as _

from rando import logger


register = template.Library()


@register.simple_tag
def fileinclude(filename, language):
    try:
        path = os.path.join(settings.MEDIA_ROOT, 'pages', language, filename)
        return open(path, 'r').read()
    except IOError as e:
        try:
            path = os.path.join(settings.MEDIA_ROOT, filename)
            return open(path, 'r').read()
        except IOError as e:
            logger.error(e)
    return _('Empty')


@register.filter
def kilo(value):
    return value / 1000.0


@register.filter
def thumbnail(trek):
    if trek.properties.thumbnail:
        assert trek.properties.thumbnail.startswith(settings.MEDIA_URL)
        return trek.properties.thumbnail
    return overridable("img/default-thumbnail.jpg")


@register.filter
def listid(objects, key='id'):
    print objects
    ids = [str(obj[key]) for obj in objects]
    return ','.join(ids)


@register.filter(is_safe=True)
def pictogram(value, klass=""):
    if value is None or not value.pictogram:
        return ''
    assert value.pictogram.startswith(settings.MEDIA_URL), '%s does not start with %s' % (value.pictogram, settings.MEDIA_URL)
    url = value.pictogram
    label = value.label
    markup = '<div class="pictogram %(klass)s" data-original-title="%(label)s"><img src="%(url)s" alt="%(label)s"></div>'
    return mark_safe(markup % locals())


@register.simple_tag
def overridable(value):
    overriden = os.path.join(settings.MEDIA_ROOT, value)
    if os.path.exists(overriden):
        return os.path.join(settings.MEDIA_URL, value)
    return static(value)
