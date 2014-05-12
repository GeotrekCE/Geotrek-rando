from django.shortcuts import redirect
from django.core.urlresolvers import reverse
from localeurl.utils import locale_url, strip_path


def locale_redirect(*args, **kwargs):
    """ Redirect shortcut with forced locale.
    """
    locale = kwargs.pop('locale')
    url = reverse(*args, **kwargs)
    ignored, path = strip_path(url)
    url = locale_url(path, locale=locale)
    return redirect(url)
