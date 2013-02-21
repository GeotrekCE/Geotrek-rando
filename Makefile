install: bin/python

bin/python:
	virtualenv .
	bin/python setup.py develop

sync: bin/python
	bin/python ./manage.py sync_trekking

serve: bin/python
	bin/python ./manage.py runserver 8888

deploy: bin/python
	mkdir -p var/input
	mkdir var/input/media
	mkdir var/static
	mkdir var/pages
	bin/python ./manage.py collectstatic

test: bin/python
	bin/python ./manage.py test

clean:
	rm -rf bin/ lib/ build/ dist/ *.egg-info/ include/ local/
