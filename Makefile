SHELL = /bin/bash

install: bin/python

bin/python:
	virtualenv .
	bin/python setup.py develop

sync: bin/python
	bin/python ./manage.py sync_content
	touch var/input/media/style.css

serve: bin/python
	bin/python ./manage.py runserver 0.0.0.0:8888

deploy: bin/python
	bin/python setup.py install
	mkdir -p var/input
	mkdir -p var/static
	mkdir -p var/input/media
	mkdir -p var/input/media/pages
	touch var/input/media/style.css
	cp -n rando/settings/prod.py.sample rando/settings/prod.py
	bin/python ./manage.py collectstatic --clear --noinput --ignore="*.less"

test: bin/python
	bin/python ./manage.py test core backpack feedback tourism trekking flatpages view3d

clean:
	rm -rf src/ bin/ lib/ build/ dist/ *.egg-info/ include/ local/

ping_google:
	bin/python ./manage.py ping_google $(url)/sitemap.xml

all_makemessages:
	for dir in `find rando/ -type d -name locale`; do pushd `dirname $$dir` > /dev/null; ../../manage.py makemessages --no-location --all; popd > /dev/null; done

all_compilemessages:
	for dir in `find rando/ -type d -name locale`; do pushd `dirname $$dir` > /dev/null; ../../manage.py compilemessages; popd > /dev/null; done
