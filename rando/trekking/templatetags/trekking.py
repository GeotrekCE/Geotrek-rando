import os

from django import template
from django.conf import settings
from django.core.urlresolvers import reverse
from django.utils.safestring import mark_safe

register = template.Library()


@register.filter
def thumbnail(trek):
    if trek.properties.thumbnail:
        return reverse('trekking:fileserve', args=(trek.properties.thumbnail,))
    default = os.path.join(settings.MEDIA_ROOT, 'default-thumbnail.jpg')
    if os.path.exists(default):
        return os.path.join(settings.MEDIA_URL, 'default-thumbnail.jpg')
    return os.path.join(settings.STATIC_URL, 'img', 'default-thumbnail.jpg')


@register.filter(is_safe=True)
def pictogram(value, klass=""):
    url = reverse('trekking:fileserve', args=(value.pictogram,))
    label = value.label
    markup = '<div class="pictogram %(klass)s"><img src="%(url)s" title="%(label)s" alt="%(label)s"></div>'
    return mark_safe(markup % locals())