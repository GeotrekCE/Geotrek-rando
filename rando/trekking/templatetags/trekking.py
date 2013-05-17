import os
import logging
from datetime import datetime, timedelta

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
def kilo(value):
    return value / 1000.0


@register.filter
def duration(value):
    seconds = timedelta(minutes=float(value) * 60)
    duration = datetime(1, 1, 1) + seconds
    days = duration.day - 1
    if days >= 8:
        return _("More than %s days") % 8
    if days > 1:
        return _("%s days") % days
    if days == 1 or 12 <= duration.hour < 24:
        return _("%s day") % 1
    if duration.hour > 0:
        return _("%(hour)sH%(min)s") % {'hour': duration.hour,
                                        'min': "%s" % duration.minute if duration.minute > 0 else ""}
    return _("%s min.") % duration.minute


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
    markup = '<div class="pictogram %(klass)s"><img src="%(url)s" title="%(label)s" alt="%(label)s"></div>'
    return mark_safe(markup % locals())
