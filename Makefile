install:
	virtualenv .
	bin/python setup.py install

sync:
	./manage.py sync_trekking
