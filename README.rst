**Geotrek rando**, public portal of *Geotrek* (http://geotrek.fr).

.. image :: https://api.travis-ci.org/makinacorpus/Geotrek-rando.png?branch=master
    :alt: Build Status
    :target: https://travis-ci.org/makinacorpus/Geotrek-rando

Demo instances :

* `Development <http://rando.makina-corpus.net>`_
* `Parc National des Écrins <http://rando.ecrins-parcnational.fr>`_
* `Parc National du Mercantour - Parco delle Alpi Marittime <http://rando.mercantour.eu>`_


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

:note:

    Do not forget basic security packages like ``fail2ban`` or
    `automatic security updates <https://help.ubuntu.com/community/AutomaticSecurityUpdates>`_.


Copy and extract the source archive, and run install :

::

    unzip vX.Y.Z.zip
    cd Geotrek-rando-vX.Y.Z/

    make install deploy


Configuration
-------------

The configuration file is ``rando/settings/prod.py``

Be careful to save the file with UTF-8 encoding, especially if you use accents and special characters.

Most important settings :

* **GEOTREK_SERVER**
* **GEOTREK_USER**
* **GEOTREK_PASSWORD**
* **TITLE** (in every supported language, fallback to English)
* **DESCRIPTION** (in every supported language, fallback to English)

If you run the application on a preproduction, it is wise to set ``PREPROD = True``, in order
to disable Robots (Google) indexing.

Note that Apache has to be restart to apply changes in settings.

It is also wise to change the permissions of this file, in order to protect sensitive information
such as Geotrek password.


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

    sudo a2enmod headers
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

Setup the Geotrek server you want to synchronize, using the ``GEOTREK_SERVER`` setting.

::

    cd Geotrek-rando-X.Y.Z/

    make sync

You can schedule synchronization in a crontab (e.g. every hour) :

::

    crontab -e

Add the following line

::

    0 * * * *  cd /path/to/application && /usr/bin/make sync


Regularly (once a week), you can also notify Google that your sitemap changed, using this :

::

    30 1 * * 0  cd /path/to/application && /usr/bin/make ping_google url=http://rando.server.com


For *Geotrek-mobile*, the server needs to build the ressource files (tiles,
data, media) for each trek. Add the following schedule task :

::

    15 * * * *  cd /path/to/application && bin/python ./manage.py build_mobile_data http://rando.server.com


===============
SOFTWARE UPDATE
===============

All versions are published on `the Github forge <https://github.com/makinacorpus/Geotrek-rando/releases>`_.

Before upgrading, **READ CAREFULLY** the release notes, either from the ``CHANGES``
files `or online <https://github.com/makinacorpus/Geotrek-rando/releases>`_.

Download and extract the new version :

::

    unzip vX.Y.Z.zip
    cd Geotrek-rando-X.Y.Z/


Copy the configuration and synchronized files of the previous version :

::

    # Synchronized files
    cp -aR ../previous-version/var/ .

    # Prod settings
    cp ../previous-version/rando/settings/prod.py rando/settings/prod.py


Make sure the Apache virtualhost refers to the folder of this new version.
In order to avoid editing Apache configuration at each upgrade, you can
rename the folders.

::

    mv /path/to/application/ /path/to/application.old/
    mv /path/to/Geotrek-rando-X.Y.Z/ /path/to/application/


Deploy !

::

    make install deploy

Restart !

::

    sudo /etc/init.d/apache2 restart


Check the version in the web page source. Re-synchronize, just in case.


=============
CUSTOMIZATION
=============

All customizations in this paragraph happen in the ``var/input/media/`` folder.


Basic FTP access configuration
------------------------------

You can setup a FTP access to this *media* folder.

::

    sudo apt-get install vsftpd


Create a user *editor* whose ``$HOME`` will be the *media* folder (**replace full path**).

::

    sudo adduser --home /path/to/application/var/input/media/ editor

Done !


Static files
------------

All files available in this *media* folder will be available at the ``/media`` URL.


Static pages
------------

All static pages will be loaded from a ``pages`` folder.

Create a subfolder for each language (``fr/``, ``en/``, ``it/`` ...).

Create ``*.html`` files in these folders. The name of the file becomes the title of the page.

If you want to customize the alphabetical order, you can use prefixes with numbers (for example,
 ``pages/fr/01-Réglementation.html``.)

If you want the same page if various language, make sure it has the same prefix number (for example, ``pages/fr/03-Accompagnateurs.html``, ``pages/en/03-Guides.html``, ``pages/es/03-Guias.html``, ...).


:notes:

    If a trek is in the park center, a link to the *Park Policy* (*Réglementations*) will
    be shown in the page.
    The policy page **must have** a prefix id (because of language switching).
    You can control the id (default is *1*) by changing the setting ``FLATPAGES_POLICY_PAGE``
    to the number of your choice. (e.g. ``FLATPAGES_POLICY_PAGE = 3``).



If you want to use special characters in pages titles, use the ``FLATPAGES_TITLES`` setting.
For example, if you have the following files ::

    pages/fr/001-reglement.html
    pages/fr/002-a-votre-ecoute.html
    pages/de/001-Reglen.html
    pages/de/002-fuer-sie.html

You can set titles using this setting ::

    FLATPAGES_TITLES = {
        'reglement': u'Réglement',
        'a-votre-ecoute': u'À vôtre écoute',
        'fuer-sie': u'Für Sie'
    }


You can hide the static pages from the navigation bar, but setting a specific target.
They be will reachable at ``/page/<slug>`` but won't be listed in the navigation.
By default only ``all`` and ``rando`` are shown in the navigation bar. In *Geotrek-mobile*, only
targets ``all`` and ``mobile`` will be taken into account.

    FLATPAGES_TARGETS = {
        'avertissements': 'mobile',
        'credits': 'hidden'
    }


CSS style
---------

A ``style.css`` is loaded in the page, and allows to override every part of the website.


Header
------

Upload your file and add a custom section in the custom CSS :

::

    .navbar-inner {
        background: url(/media/yourfile.jpg) no-repeat;
    }


Footer
------

Content is taken from a file named ``footer.html``, in the ``media/`` folder.

If you wish to have a different one for each language, add a ``footer.html``
file in every language folder of ``media/pages/``.

To hide the footer, add in ``style.css``:

::

    footer {
        display: none;
    }

    .container-content {
        bottom: 0px;
    }

This file can be used to inject extra Javascript code, using a ``<script>`` tag.


Feedback form
-------------

The feedback form is protected with the reCaptcha Antispam system.

* Go to http://www.google.com/recaptcha and create an account
* Follow the instructions to get public/private key for your domain name
* Add respective values in settings ``RECAPTCHA_PUBLIC_KEY`` and ``RECAPTCHA_PRIVATE_KEY``.


Trek filters
------------

Ascent filter step values can be controlled with `FILTER_ASCENT_VALUES`, which
shall be a list of integer values expressed in meters.

Duration filters labels and values can be controlled with ``FILTER_DURATION_VALUES``,
which shall be a list of tuples ``('label', value)``, with values expressed in hours.


Map elements
------------

The background layers can be configured from ``settings/prod.py``. See sample.


The map elements colors can be set from the ``footer.html`` page, using a ``<script>`` block
and a custom JavaScript file :

::

    <script type="text/javascript" src="/media/custom.js"></script>

And in ``custom.js`` :

::


    var TREK_LAYER_OPTIONS = {
        style: {'color': '#F89406', 'weight': 5, 'opacity': 0.8},
        hoverstyle: {'color': '#F89406', 'weight': 5, 'opacity': 1.0},
        outlinestyle: {'color': 'yellow', 'weight': 10, 'opacity': 0.8},
        positionstyle: {'fillOpacity': 1.0, 'opacity': 1.0, 'fillColor': 'white', 'color': 'black', 'width': 3},
        arrowstyle: {'fill': '#E97000', 'font-weight': 'bold'}
    };


``style`` is the base color; ``hoverstyle`` is for mouse over; ``outlinestyle`` is for outline effect.
``arrowstyle`` controls the color and weight of direction arrows.

See `Leaflet documentation on paths <http://leafletjs.com>`_ for more details.


Extra background layers
-----------------------

For example, you may want to add a layer with the boundaries of the park, or infrastructures, equipments...

Using Tilemill, you can create a layer with transparency, from a local ShapeFile, PostGIS query, KML etc. You can export the layer as a MBTiles file.

You can host the resulting MBTiles yourself (`with Apache <http://blog.mathieu-leplatre.info/serve-your-map-layers-with-a-usual-web-hosting-service.html>`_),
or on dedicated services like `MapBox <http://mapbox.com>`_.

The tiles of this layer can then be added to the maps, using this snippet (for example) of code in ``custom.js``. See Leaflet API documentation if any problem.

::

    // Add it on all maps at initialization
    $(window).on('map:ready', function (e, map) {
        L.tileLayer('http://livembtiles.makina-corpus.net/makina/coeur-ecrins/{z}/{x}/{y}.png')
         .addTo(map)
         .bringToFront();
    });


The same technique could be applied using a local vectorial GeoJSON layer. Caution with the weight of the page, and performance with mobile users.

::

    $(window).on('map:ready', function (e, map) {
        $.get('/media/layer.geojson', function (data) {
            L.geoJson(data, {
                clickable: false,
                style: {color: 'darkgreen',
                        fillColor: 'green',
                        fillOpacity: 0.2},
            })
            .addTo(map)
            .bringToBack();
        });
    });


Altimetric profile colors
-------------------------

In ``custom.js`` :

::

    var ALTIMETRIC_PROFILE_OPTIONS = {
        fillColor: '#FFD1A1',
        lineColor: '#F77E00',
        lineWidth: 3,
    };

See `Jquery sparkline <http://omnipotent.net/jquery.sparkline>`_ options.


Images
------

The following images, if placed in the *media* folder, will be used instead
of the generic material :

* ``img/favicon.png``
* ``img/icon-57.png``
* ``img/icon-72.png``
* ``img/icon-144.png``
* ``img/default-thumbnail.jpg`` (*if trek has no pictures attached*)
* ``img/default-preview.jpg``

In order to replace an icon (ex. buttons, park center, ...), just add a file
in the *media* folder, and override the respective CSS class in your custom
*style.css*.

::

    #park-center-warning {
        background-image: url(/media/pn-logo.png);
    }


Home popup
----------

In ``settings/prod.py``, enable with :

::

    POPUP_HOME_ENABLED = True


Content is taken from a file named ``popup_home.html``, in the ``media/``
folder, along with ``footer.html``.

If you wish to have a different one for each language, add a ``popup_home.html``
file in every language folder of ``media/pages/``.

An example of HTML content can be found here : https://gist.github.com/Grsmto/8536822

:note:

    In order to prevent page reload for internal links, add the class ``pjax``
    to the links (e.g. ``<a href="/" class="pjax">Link</a>``).

    In order to open home page (main map) on saved search links when popup is shown
    from another page, prefix all links with ``/`` (e.g. ``href="/#3782-20ce-360-9602-60a6"``).
    And make sure to put ``pjax`` class on the ``<a>`` tag!

Main behaviour of home popup :

* Shown on first visit only (tracked using *LocalStorage*)
* Shown when landing on home only (no permalink, saved-search or trek detail)
* Not shown on mobile (since filters are not shown either)

In order to add a *random* trek section, add a ``data-trek`` attribute with ``random``
value or trek *id* for specific trek. Markup example :

::

    <div class="span4" data-trek="random">
        <a class="pjax profile">
            <img class="preview">
            <span class="caption">Highlight</span>
        </a>
    </div>

Illustration images are better viewed if they have the same aspect ratio
as trek illustrations.


TIS Layers
----------

Additional tourism layers can be added and shown as markers on maps.

* Set ``TOURISM_ENABLED = True`` in settings.
* In Geotrek admin (>0.23), set up some datasources layers, with `public`
  among targets.
* Synchronize


Disqus comments on detail pages
-------------------------------

It is possible to enable comment threads in detail pages, using Disqus.

* Set ``DISQUS_ENABLED`` to True
* Go to http://disqus.com, and create an account
* Obtain a shortname for the domain name (*New Website*)
* Specify ``DISQUS_SHORTNAME`` in settings.
* Configure the apparence and default language from Disqus parameters webpage.


POI panel on detail pages
-------------------------

By default, the POI panel on the map is automatically opened. This may be changed.

* Set ``POI_PANEL_OPENED = False`` in settings.

False will make the panel closed, and the POI layer hidden. True will make the panel opened and the POI layer visible.

===============
TROUBLESHOOTING
===============

Uploaded files are not served by Apache
---------------------------------------

Make sure Apache has read access to all files uploaded and created in the *media* folder.


Synchronization failed with 404
-------------------------------

::

    /fr/image/trek-903939.png ... 404 (Failed)
    Failed to retrieve http://x.x.x.x/image/trek-903939.png (code: 404)
    Failed!

Try to access this URL manually and check the logs on the remote server.


===========
DEVELOPMENT
===========

::

    make install
    ./bin/pip install -r dev-requirements.pip

* `Install CasperJS <http://docs.casperjs.org/en/latest/installation.html>`_

::

    make test

Use development settings :

::

    export DJANGO_SETTINGS_MODULE=rando.settings.dev


Start development instance :

::

    make sync
    make serve


=========
RATIONALE
=========

This application has no database, no ORM. It basically reads files on disk,
and serves views. The rest happens on client-side in Javascript.

Why Django ?
------------

We chose Django only because we thought that this application may evolve and
require Django's ecosystem to be enriched.

Currently, we only have two Django applications as serious dependencies :

* Django-localeurl is great and provides great shortcuts.
* Django-leaflet helps a lot but is not a key stone.


=======
CREDITS
=======

* *Ecology* by Diego Naive from the Noun Project
* *3D Glasses* by Fabio Grande from The Noun Project
* *Binoculars* by Creatorid'immagine from the Noun Project
* *Mont Valier, Couserans*, Wikimedia by Valier
* *Bus-Stop* by Pierre-Luc Auclair from The Noun Project
* *Distance* by Tommy Lau from The Noun Project
* *Ascend* by Michael Kussmaul from The Noun Project
* *Hiking* by Johana from The Noun Project
* *Eagle* by Steve Laing from The Noun Project
* *Eye-In-The-Sky* by Cédric Villain from The Noun Project

=======
AUTHORS
=======

    * Sylvain Beorchia
    * Adrien Denat
    * Yahya Mzoughi
    * Gaël Utard
    * Mathieu Leplatre
    * Anaïs Peyrucq
    * Satya Azemar
    * Camille Monchicourt

|makinacom|_

.. |makinacom| image:: http://depot.makina-corpus.org/public/logo.gif
.. _makinacom:  http://www.makina-corpus.com


=======
LICENSE
=======

    * OpenSource - BSD
    * Copyright (c) Parc National des Écrins - Parc National du Mercantour - Parco delle Alpi Marittime - Makina Corpus


.. image:: http://depot.makina-corpus.org/public/geotrek/logo-pne.png
    :target: http://www.ecrins-parcnational.fr


.. image:: http://depot.makina-corpus.org/public/geotrek/logo-pnm.png
    :target: http://www.mercantour.eu


.. image:: http://depot.makina-corpus.org/public/geotrek/logo-pnam.png
    :target: http://www.parcoalpimarittime.it


.. image:: http://depot.makina-corpus.org/public/logo.gif
    :target: http://www.makina-corpus.com
