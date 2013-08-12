=========
CHANGELOG
=========

1.22 (unreleased)
-----------------

* Fix ping_google command, add url=http://rando.server.com parameter (fixes #754)
* Fix flat pages naming and numbering (fixes #759)
* Add spanish translation
* Remove hack for difficulty level.
* Hide column "on the way" if no POI (fixes #761)
* Set detail pictures width to 100% of column (fixes #36)
* Fixes links in search results, use explicit language prefix (fixes #43)

:notes:
    Be careful with image aspect ratios ! 100% width means that portrait
    pictures will be extended vertically. Make sure that all pictures
    have the same width / height !

* Document ``arrowstyle`` for direction arrow styling (fixes #27)
* Removing trailing comma in search results too (fixes #5)
* Fix route filter (fixes #10)
* Fix display of number of results while navigating (fixes #6)
* Add ability to have accents in flat pages titles, see README (fixes #15)
* Fix centering on trek when it's below search results (fixes #8)

:notes:

    After upgrading to this release, make sure your difficulty levels
    are ordered by *id* column in Geotrek DB, or use the last version (0.20) to
    be able to edit *ids* in Geotrek Adminsite.

* Fix trek detail language redirections (fixes #9)
* Upgraded to Leaflet 0.6.4
* Upgraded to django-leaflet 0.7

:notes:

    In order to upgrade, run ``make clean`` before ``make deploy``.

    Attributions settings have changed. Attribution string is now the third
    item in layer definition (ex: ('detail', 'http://...', '(c) OSM')).
    
    Add a line with ``NO_GLOBALS: False,`` in ``LEAFLET_CONFIG``.
    
    Compare yours with example bloc in ``settings_local.py.sample``.

* Fixes popup opens after second clic only (fixes #1)


1.21 (2013-07-11)
-----------------

* Fix ping google command

1.20 (2013-07-10)
-----------------

* Fix count of results after filtering
* Drag enabled on detail map
* Mobile CSS fixes

1.19 (2013-07-09)
-----------------

* Fix goggles behaviour
* Add tooltips everywhere
* Fix navigation bug

1.18 (2013-07-08)
-----------------

* Fix translations
* POIs sorted by type and alphabetic order
* Fix search bug with spaces
* Various CSS fixes

1.17 (2013-07-05)
-----------------

* Add ability to have copyrights on map tiles

1.16 (2013-06-21)
-----------------

* Add ability to have different layers on home and detail
* Fix typos in README
* Add ability to add extra layers on maps (like park boundaries etc.)
* Fix easing of left panel

1.15 (2013-06-12)
-----------------

* Show information desk properly in detail page
* Fix blur lines in Android (positions multiple of 2)
* Better touch experience, remove click delay (fastclick)

1.14 (2013-05-30)
-----------------

* Filters can now be set from URL hash
* Advanced filters are now always visible
* Rename "Length" to "Total length"
* Remove networks from detail page
* Added reset button for search with mobile
* Added help for custom map tiles
* Stripped down JQueryUI to sliders only
* Added information desk field (Geotrek 0.18)
* Tooltips on themes filters
* Fixed transport bloc position in detail page
* 3 columns layout of detail page
* Add label "On the way" for POIs column
* Update italian translation


1.13 (2013-05-17)
-----------------

* Responsive design
* 3D view
* Show progress on trek on altimetric profile mouse over
* Show difficulty on 4 levels
* Fix long names
* Removed "Home" link in navigation
* Reduced opacity of themes and usages in detail page
* Show arrival only if not empty
* Fix ascent french translation
* Run slideshow automatically
* Moved blocks to prepare 3 columns version
* Rename "backpack" to "favorites"
* Show National Park logo if trek in park center
* Show altimetric profile in full width
* Allow to customize altimetric profile colors
* Removed fixed height of POIs list
* Show duration in minutes, hours and days
* Added setting to disable PRINT links
* Added setting to disable 3D view


See project history in `Geotrek history <https://raw.github.com/makinacorpus/Geotrek/master/docs/history.rst>`_ (French).
