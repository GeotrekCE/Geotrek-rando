import os

from django import template
from django.conf import settings
from django.utils.safestring import mark_safe

register = template.Library()


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
    assert value.pictogram.startswith(settings.MEDIA_URL)
    url = value.pictogram
    label = value.label
    markup = '<div class="pictogram %(klass)s"><img src="%(url)s" title="%(label)s" alt="%(label)s"></div>'
    return mark_safe(markup % locals())