import os

from django.conf import settings
from django.views.static import serve as static_serve


def fileserve(request, path):
    """
    Rewrite URLs to use current language as folder root prefix.
    TODO: Could be done with ``mod_rewrite`` at deployment.
    """
    path = path[1:] if path.startswith('/') else path
    if not os.path.exists(os.path.join(settings.INPUT_DATA_ROOT, path)):
        path = os.path.join(request.LANGUAGE_CODE, path)
    return static_serve(request, path, document_root=settings.INPUT_DATA_ROOT)
