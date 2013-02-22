import os
import re
import logging

from django import template
from django.conf import settings
from django.utils.safestring import mark_safe
from django.utils.translation import ugettext_lazy as _

logger = logging.getLogger(__name__)
register = template.Library()


@register.simple_tag
def fileinclude(filename):
    try:
        path = os.path.join(settings.MEDIA_ROOT, filename)
        return open(path, 'r').read()
    except IOError as e:
        logger.error(e)
    return _('Empty')


@register.filter
def thumbnail(trek):
    if trek.properties.thumbnail:
        url = trek.properties.thumbnail
        assert settings.MEDIA_URL in url, '%s does not contain %s' % (url, settings.MEDIA_URL)
        url = re.sub('^(.*)%s' % settings.MEDIA_URL, settings.MEDIA_URL, url)
        return url
    # Default, provided at deployment
    default = os.path.join(settings.MEDIA_ROOT, 'default-thumbnail.jpg')
    if os.path.exists(default):
        return os.path.join(settings.MEDIA_URL, 'default-thumbnail.jpg')
    # Default thumbnail
    return os.path.join(settings.STATIC_URL, 'img', 'default-thumbnail.jpg')


@register.filter(is_safe=True)
def pictogram(value, klass=""):
    if value is None:
        return ''
    url = value.pictogram
    assert settings.MEDIA_URL in url, '%s does not contain %s' % (url, settings.MEDIA_URL)
    url = re.sub('^(.*)%s' % settings.MEDIA_URL, settings.MEDIA_URL, url)
    label = value.label
    markup = '<div class="pictogram %(klass)s"><img src="%(url)s" title="%(label)s" alt="%(label)s"></div>'
    return mark_safe(markup % locals())
