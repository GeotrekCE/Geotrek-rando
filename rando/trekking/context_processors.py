from .models import Trek, Settings


def main(request):
    server_settings = Settings.objects.all()
    return {
        'treks_url': Trek.filepath,
        'map_extent': server_settings.map.extent
    }