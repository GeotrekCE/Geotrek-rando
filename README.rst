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

    make install

Prepare deployment :

::

    cd /path/to/application
    make deploy


Configuration
--------------  

Copy ``rando/settings_local.py.sample`` to ``rando/settings_local.py` and edit it to override settings.

Most important settings : 

* **CAMINAE_SERVER**
* **TITLE** (in every supported language, fallback to English)
* **DESCRIPTION** (in every supported language, fallback to English)

If you run the application on a preproduction, it is wise to set ``PREPROD = True``, in order
to disable Robots indexing.


Apache vhost
------------

Copy the virtual host example :

::

    sudo cp rando/apache.vhost.sample /etc/apache2/sites-available/rando


Edit it and replace ``/PATH_TO_SOURCE/`` by the correct absolute path.

Activate it and restart apache :

::

    sudo a2ensite rando
    sudo /etc/init.d/apache2 restart


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

    crontab -e

    # Add the following line

    0 * * * *  cd /path/to/application && /usr/bin/make sync


Regularly (once a week), you can also notify Google that your sitemap changed, using this : 

::

    make ping_google


=============
CUSTOMIZATION
=============

All customizations in this paragraph happen in the ``var/input/media/`` folder.


Basic FTP access configuration
==============================

You can setup a FTP access to this *media* folder. 

::

    sudo apt-get install vsftpd


Create a user *editor* whose ``$HOME`` will be the *media* folder (**replace full path**).

::

    sudo adduser --home /path/to/application/var/input/media/ editor

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

If you want the same page if various language, make sure it has the same prefix number (for example, ``pages/fr/03-Accompagnateurs.html``, ``pages/en/03-Guides.html``, ``pages/es/03-Guias.html``, ...).


:notes:

    If a trek is in the park center, a link to the *Park Policy* (*Réglementations*) will be shown in the page. Therefore, your policy page **must have** a prefix ``01-``.


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
