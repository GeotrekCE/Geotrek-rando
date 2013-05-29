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

    cd /path/to/application
    make install

Prepare deployment :

::

    make deploy


Configuration
--------------  

Copy ``rando/settings_local.py.sample`` to ``rando/settings_local.py` and edit it to override settings.

Be careful to save the file with UTF-8 encoding, especially if you use accents and special characters.

Most important settings :

* **CAMINAE_SERVER**
* **TITLE** (in every supported language, fallback to English)
* **DESCRIPTION** (in every supported language, fallback to English)

If you run the application on a preproduction, it is wise to set ``PREPROD = True``, in order
to disable Robots (Google) indexing.


Apache vhost
------------

Copy the virtual host example :

::

    sudo cp rando/apache.vhost.sample /etc/apache2/sites-available/rando


Edit it and replace ``/PATH_TO_SOURCE/`` by the correct absolute path (i.e where is this README file)

::

    sudo nano /etc/apache2/sites-available/rando

Be careful, the sample Apache configuration assumes that you have python in version 2.7 (Default in Ubuntu 12.04+ and Debian wheezy).
If you run python 2.6 (Debian squeeze), make sure the line ``WSGIPythonPath`` points to the folder ``lib/python2.6/site-packages``.

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

To hide the footer, add in ``style.css``:

::

    footer {
        display: none;
    }

    #container-content {
        bottom: 0px;
    }


Map elements
============

The tile layer can be configured from ``settings.py``. For example, in order to use IGN WMTS tiles :

::

    LEAFLET_CONFIG['TILES_URL'] = 'http://gpp3-wxs.ign.fr/tiles/<YOUR KEY>/geoportail/wmts?LAYER=GEOGRAPHICALGRIDSYSTEMS.MAPS&EXCEPTIONS=text/xml&FORMAT=image/jpeg&SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}'


The map elements colors can be set from the ``footer.html`` page, using a ``<script>`` block :

::

    <script type="text/javascript">
        var TREK_LAYER_OPTIONS = {
            style: {'color': '#F89406', 'weight': 5, 'opacity': 0.8},
            hoverstyle: {'color': '#F89406', 'weight': 5, 'opacity': 1.0},
            outlinestyle: {'color': 'yellow', 'weight': 10, 'opacity': 0.8},
            positionstyle: {'fillOpacity': 1.0, 'opacity': 1.0, 'fillColor': 'white', 'color': 'black', 'width': 3}
        };
    </script>

``style`` is the base color; ``hoverstyle`` is for mouse over; ``outlinestyle`` is for outline effect. See `Leaflet documentation on paths <http://leafletjs.com>`_ for more details.


Altimetric profile colors
=========================

In the ``footer.html`` block :

::

    <script type="text/javascript">
        var ALTIMETRIC_PROFILE_OPTIONS = {
            fillColor: '#FFD1A1',
            lineColor: '#F77E00',
            lineWidth: 3,
        };
    </script>

See `Jquery sparkline <http://omnipotent.net/jquery.sparkline>`_ options.


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


Synchronization failed with 404
===============================

::

    /fr/image/trek-903939.png ... 404 (Failed)
    Failed to retrieve http://x.x.x.x/image/trek-903939.png (code: 404)
    Failed!

Try to access this URL manually and check the logs on the remote server.


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
