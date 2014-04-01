from rando.tourism.models import DataSource

def main(request):
    return {
        'datasources_url': DataSource.filepath,
    }
