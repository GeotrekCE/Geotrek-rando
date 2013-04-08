#!/usr/bin/python
# -*- coding: utf8 -*-
import os
from setuptools import setup

here = os.path.abspath(os.path.dirname(__file__))


setup(
    name='rando',
    version=open(os.path.join(here, 'VERSION')).read().strip(),
    author='Makina Corpus',
    author_email='geobi@makina-corpus.com',
    url='http://makina-corpus.com',
    install_requires = [
        'Django == 1.4.2',
        'requests == 0.14.2',
        'termcolor == 1.1.0',
        'django-leaflet == 0.5.1',
        'django-localeurl == 1.5',
        'django-pjax == 1.2',
        'easydict == 1.4',
        'django_compressor == 1.2',
        'django-ganalytics == 0.2',
    ],
)
