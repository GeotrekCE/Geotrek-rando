import logging

pkg_resources = __import__('pkg_resources')
distribution = pkg_resources.get_distribution('rando')

#: Module version, as defined in PEP-0396.
__version__ = distribution.version


logger = logging.getLogger(__name__)


class classproperty(object):
    def __init__(self, getter):
        self.getter = getter

    def __get__(self, instance, owner):
        return self.getter(owner)

