from rando.core.models import JSONModel, GeoJSONModel


class DataSource(JSONModel):
    filepath = 'api/datasource/datasources.json'


class InformationDesk(GeoJSONModel):
    filepath = 'api/informationdesk/informationdesk.geojson'
