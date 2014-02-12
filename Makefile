install: bin/python

bin/python:
	virtualenv .
	bin/python setup.py develop
	bin/python pip install -r requirements.pip

sync: bin/python
	bin/python ./manage.py sync_trekking
	touch var/input/media/style.css

serve: bin/python
	bin/python ./manage.py runserver 8888

deploy: bin/python
	bin/python setup.py install
	mkdir -p var/input
	mkdir -p var/static
	mkdir -p var/input/media
	mkdir -p var/input/media/pages
	touch var/input/media/style.css
	bin/python ./manage.py collectstatic --clear --noinput

test: bin/python
	bin/python ./manage.py test trekking flatpages

clean:
	rm -rf src/ bin/ lib/ build/ dist/ *.egg-info/ include/ local/

ping_google:
	bin/python ./manage.py ping_google $(url)/sitemap.xml

