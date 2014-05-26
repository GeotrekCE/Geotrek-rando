from rando import logger
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
    reply = client.post('/report/add/', data=record, allow_redirects=False)
    if reply.status_code != 302:
        logger.error("Error at creating feedback report")
        logger.error(reply.content)
        raise Exception("Could not send record")
