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

    sudo apt-get install -y python-virtualenv libapache2-mod-wsgi python-dev build-essential unzip


Copy and extract the source archive, and run install :

::

    cd /path_to_webapi/faune/
    make install

Prepare deployment :

::

    make deploy


Configuration
--------------  

Copy ``settings_local.py.sample`` to ``settings_local.py` and edit it to override settings.

:note:

    Do not change ``MEDIA_URL`` or expect problems.

Apache vhost
------------

Copy the virtual host example :

::

    sudo cp rando/apache.vhost.sample /etc/apache2/sites-available/rando


Edit it and replace ``/PATH_TO_SOURCE/`` by the correct absolute path.

Activate it and restart apache :

::

    sudo a2ensite rando
    sudo /etc/init.d/apache restart


Give Apache permissions in application folder :

::

    sudo chgrp -R www-data var/
    sudo chmod -R g+rw var/

And *synchronize* at least once !


===============
SYNCHRONIZATION
===============

Setup the Caminae server you want to synchronize, using the ``CAMINAE_SERVER`` setting.

::

    make sync

You can schedule synchronization in a crontab (e.g. every hour) :

::

    0 * * * *  cd /path/to/application && /usr/bin/make sync


=============
CUSTOMIZATION
=============

All customizations in this paragraph happen in the ``var/input/media/`` folder.


Basic FTP access configuration
==============================

You can setup a FTP access to this *media* folder. 

::

    sudo apt-get install vsftpd


Create a user *editor* whose ``$HOME`` will be the *media* folder.

::

    sudo adduser --home `pwd`/var/input/media/ editor

Done !


Static files
============

All files available in this *media* folder will be available at the ``/media`` URL.

Static pages
============

All static pages will be loaded from a ``pages`` folder.

Create a subfolder for each language (``fr/``, ``en/``, ``it/`` ...).

Create ``*.html`` files in these folders. The name of the file becomes the title of the page.

If you want to customize the alphabetical order, you can use prefixes with numbers (for example,
 ``pages/fr/01-Réglementation.html``.)


CSS style
=========

A ``style.css`` is loaded in the page, and allows to override every part of the website.

Header
======

Upload your file and add a custom section in the custom CSS :

::

    .navbar-inner {
        background: url(/media/yourfile.jpg) no-repeat;
    }

Footer
======

A ``footer.html`` is loaded and injected into the page.


Default trek thumbnail
======================

If a trek has no pictures attached, a default thumbnail is used.

A ``default-thumbnail.jpg`` is loaded from the *media* folder.

If missing ``var/static/img/default-thumbnail.jpg`` will be used.

:note:

    For preview, on the detail page, by default, ``var/static/img/default-preview.jpg`` will be used.


===============
TROUBLESHOOTING
===============

Uploaded files are not served by Apache
=======================================

Make sure Apache has read access to all files uploaded and created in the *media* folder.

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
