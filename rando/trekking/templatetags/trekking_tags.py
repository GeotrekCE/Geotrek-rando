import os
import logging

from django import template
from django.conf import settings
from django.utils.safestring import mark_safe
from django.utils.translation import ugettext_lazy as _

logger = logging.getLogger(__name__)
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
    # Default, provided at deployment
    default = os.path.join(settings.MEDIA_ROOT, 'default-thumbnail.jpg')
    if os.path.exists(default):
        return os.path.join(settings.MEDIA_URL, 'default-thumbnail.jpg')
    # Default thumbnail
    return os.path.join(settings.STATIC_URL, 'img', 'default-thumbnail.jpg')


@register.filter(is_safe=True)
def pictogram(value, klass=""):
    if value is None or not value.pictogram:
        return ''
    assert value.pictogram.startswith(settings.MEDIA_URL), '%s does not start with %s' % (value.pictogram, settings.MEDIA_URL)
    url = value.pictogram
    label = value.label
    markup = '<div class="pictogram %(klass)s" data-original-title="%(label)s"><img src="%(url)s" alt="%(label)s"></div>'
    return mark_safe(markup % locals())
