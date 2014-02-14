#!/usr/bin/python
# -*- coding: utf8 -*-
import os
from setuptools import setup

here = os.path.abspath(os.path.dirname(__file__))


install_requires = [
    'Django >=1.5,<1.7',
    'requests >=2.2,<2.3',
    'termcolor == 1.1.0',
    'django-leaflet == 0.9.0',
    'django-localeurl == 2.0.1',
    'django-pjax == 1.2',
    'easydict == 1.4',
    'django_compressor == 1.3',
    'django-ganalytics == 0.2',
    'django-recaptcha == 0.0.9',
]


setup(
    name='rando',
    version=open(os.path.join(here, 'VERSION')).read().strip(),
    author='Makina Corpus',
    author_email='geobi@makina-corpus.com',
    url='http://makina-corpus.com',
    install_requires=install_requires
)
