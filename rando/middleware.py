from django.utils.cache import patch_vary_headers


class DoNotTrackMiddleware(object):
    """
    Since template content may depend on this header, built the cache
    key upon it.
    """
    def process_response(self, request, response):
        patch_vary_headers(response, ('DNT',))
        return response
