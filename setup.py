#!/usr/bin/python
# -*- coding: utf8 -*-

from setuptools import setup

setup(
    name='rando',
    version='1.0.dev0',
    author='Makina Corpus',
    author_email='geobi@makina-corpus.com',
    url='http://makina-corpus.com',
    install_requires = [
        'django == 1.4.2',
        'requests == 0.14.2',
        'django-leaflet == 0.4.1',
        'django-localeurl == 1.5',
        'django-pjax == 1.2',
        'easydict == 1.4'
    ],
)
