import urllib

from django.core.management.base import BaseCommand


PING_URL = "http://www.google.com/webmasters/tools/ping"


class Command(BaseCommand):
    help = "Ping Google with an updated sitemap, pass optional url of sitemap"

    def execute(self, *args, **options):
        sitemap_url = args[0]
        params = urllib.urlencode({'sitemap': sitemap_url})
        urllib.urlopen("%s?%s" % (PING_URL, params))
