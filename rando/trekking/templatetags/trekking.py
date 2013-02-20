import os

from django import template
from django.conf import settings
from django.core.urlresolvers import reverse


register = template.Library()


@register.filter
def thumbnail(trek):
    if trek.properties.thumbnail:
        return reverse('trekking:fileserve', args=(trek.properties.thumbnail,))
    default = os.path.join(settings.MEDIA_ROOT, 'default-thumbnail.jpg')
    if os.path.exists(default):
        return os.path.join(settings.MEDIA_URL, 'default-thumbnail.jpg')
    return os.path.join(settings.STATIC_URL, 'img', 'default-thumbnail.jpg')