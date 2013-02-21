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
	mkdir var/static
	mkdir var/input/media
	mkdir var/input/media/pages
	touch var/input/media/style.css
	bin/python ./manage.py collectstatic

test: bin/python
	bin/python ./manage.py test

clean:
	rm -rf bin/ lib/ build/ dist/ *.egg-info/ include/ local/
