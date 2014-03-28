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
	bin/python ./manage.py collectstatic --clear --noinput

test: bin/python
	bin/python ./manage.py test core feedback trekking flatpages view3d

clean:
	rm -rf src/ bin/ lib/ build/ dist/ *.egg-info/ include/ local/

ping_google:
	bin/python ./manage.py ping_google $(url)/sitemap.xml

generate-msg:
	(cd rando/trekking && ../../manage.py makemessages -a)
	(cd rando/feedback && ../../manage.py makemessages -a)

compile-msg:
	(cd rando/trekking && ../../manage.py compilemessages)
	(cd rando/feedback && ../../manage.py compilemessages)

msg: generate-msg compile-msg
