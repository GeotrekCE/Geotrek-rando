def send_report(**data):
    data = dict(
        name=data['name'],
        email=data['email'],
        category=data['category'],
        user_comment=data['comment'],
        latitude=data['latitude'],
        longitude=data['longitude'],
    )
    print data
