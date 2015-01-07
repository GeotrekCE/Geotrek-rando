from rando.core.models import JSONModel, GeoJSONModel, PublishedModel


class DataSource(JSONModel):
    filepath = 'api/datasource/datasources.json'


class InformationDesk(GeoJSONModel):
    filepath = 'api/informationdesk/informationdesk.geojson'


class TouristicContentCategories(JSONModel):
    filepath = 'api/touristiccontent/categories/'

    @classmethod
    def geojson_url(cls, id):
        return 'api/touristiccontent/touristiccontent.geojson?=category=%s' % id


class TouristicContent(PublishedModel):
    filepath = 'api/touristiccontent/touristiccontent.geojson'


class TouristicEvent(PublishedModel):
    filepath = 'api/touristicevent/touristicevent.geojson'
