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
        'django',
        'requests',
        'django-leaflet',
    ],
)
