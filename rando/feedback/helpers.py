from rando.core.helpers import GeotrekClient


def send_report(**data):
    record = dict(
        name=data['name'],
        email=data['email'],
        category=data['category'],
        comment=data['comment'],
        geom=''
    )

    if data['latitude'] and data['longitude']:
        record['geom'] = '{"type": "Point", "coordinates":[%s, %s]}' % (
            data.pop('longitude'),
            data.pop('latitude'))

    client = GeotrekClient()
    client.login()
    client.post('/feedback/report/add/', data=record)
