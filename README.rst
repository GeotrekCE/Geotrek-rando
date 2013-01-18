*Caminae public portal*

=====
SETUP
=====

Requirements
------------

* Python 2.6+

Installation on Debian / Ubuntu
-------------------------------

Once the OS is installed (basic installation, with OpenSSH server), with the following packages :

    sudo apt-get install -y python-virtualenv libapache2-mod-wsgi python-dev build-essentials


Copy and extract the source archive, and run install :

::

    cd /path_to_webapi/faune/
    make install

Prepare deployment :

::

    make deploy



Configuration
--------------  

Copy ``settings_local.py.sample`` to ``settings_local.py` and set settings like :

::

    CAMINAE_SERVER = 'geobi.makina-corpus.net/ecrins-sentiers'


Apache vhost
------------

Copy the virtual host example :

::

    sudo cp rando/apache.vhost.sample /etc/apache2/sites-available/rando


Edit it and replace ``/PATH_TO_SOURCE/`` by the correct absolute path.

Activate it and restart apache :

    sudo a2ensite rando
    sudo /etc/init.d/apache2 restart


============
STATIC PAGES
============

===============
SYNCHRONIZATION
===============

=======
AUTHORS
=======

    * Yahya Mzoughi
    * Gaël Utard
    * Mathieu Leplatre

|makinacom|_

.. |makinacom| image:: http://depot.makina-corpus.org/public/logo.gif
.. _makinacom:  http://www.makina-corpus.com


=======
LICENSE
=======

    * (c) Makina Corpus
