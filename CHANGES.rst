=========
CHANGELOG
=========

1.31.1 (2014-08-26)
-------------------

**BUG fixes**

* Fix display of Disqus comments in results list and loading in detail page

1.31 (2014-08-20)
-----------------

**New features**

* All attachments of treks can now be shown in detail page (fixes #131).
  By default, only audio, video and PDFs are shown, see settings ``FILELIST_ENABLED``
  and ``FILELIST_MIMETYPES``.
* Ability to choose different cameras, and view POIs details in 3D view (by Célian Garcia)
* Disqus comments integration on treks detail pages (fixes #133).
  See dedicated section in README.

**BUG fixes**

* Fix crash in synchronization when trek has no difficulty
* Fix POI list interaction after AJAX navigation (fixes #188)

**Minor changes**

* Added labels to tourism popups phone and website
* Added setting ``VIEW3D_TILES_NUMBER_LIMIT`` to control the maximum number of
  tiles to be used in the 3D view (default: 200)


1.30.1 (2014-08-14)
-------------------

* Fix crash in synchronization when link has no category


1.30 (2014-08-01)
-----------------

**Breaking changes**

* ``TILES_MAIN_MAXZOOM`` setting was renamed to ``SWITCH_DETAIL_ZOOM`` (fixes #176)

:notes:

    In order to limit the zoom level on maps, use this configuration :
    ::
        LEAFLET_CONFIG['MAX_ZOOM'] = 17

**New features**

* Now show pictograms of difficulty, route and duration when available
* Now show trek markings ("balisage") from trek networks
* Now show points of reference for treks (fixes #180)
* Complete rework of POIs list and map interaction (fixes #124)
  - Removed POI list accordions
  - Removed POI jump and uncluster on hover in list
  - Removed pictures carousels from POI list
  - Removed POI marker popup
  - Now show POI pictures in a lightbox
* Changed apparence of trek identity detail panel, now with icons
* Duration filters labels and values can now be customized via the ``FILTER_DURATION_VALUES``
  setting
* Show satellite layer in feedback form (fixes #170)

**Minor changes**

* Map help texts now show up on top
* Trek detail map does not fit information desks bounds by default
* Trek detail map does not fit POIs bounds by default
* Increased detail map height on big screens
* Added settings to control most icons sizes
* Tooltips for layer switcher do not wrap anymore


1.29.4 (2014-08-01)
-------------------

* Improved layout of information desks, added mailto link (fixes #166)
* Fix apparence of tourism popups when property is null (fixes #145)
* Remove feedback button in responsive mode (fixes #174)
* Fix position of layer switchers in responsive mode (ref #181).
* Fix top position of static pages in responsive mode (ref #181)

**Thanks Felix Merzeau**, for the first external contributions !


1.29.3 (2014-07-22)
-------------------

**BUG fixes**

* Fix redirection of policy page (fixes #172)
* Fix translation of meters in ascent filter (fixes #171)
* Fix favorites navigation from detail and static pages (fixes #175)
* Fix trek title in 3D popup (fixes #177)


1.29.2 (2014-06-28)
-------------------

**BUG fixes**

* Fix synchronization when pictogram names have special characters (url encoded)


1.29.1 (2014-06-26)
-------------------

**BUG fixes**

* Fix display even if no data is synced (first run)
* Fix display bug when 3D is disabled
* Fix missing translations
* Fix undefined maps when landing on mobile detail page
* Fixed home apparence on 1024 screens
* Fixed position of layer switcher on small screens
* Fixed apparence of fullscreen button on 3D views

**Minor changes**

* Added Makina Corpus logo in 3D view


1.29 (2014-06-24)
-----------------

**Upgrade notes**

* Add a ``satellite`` layer URL in your settings, just like the two others.
  See sample for example.

**BUG fixes**

* Fix translation of municipality
* Reduced minimap offset (fixes #122)
* Fixed minimap error when map loading too fast
* Make sure the start flag is entirely visible

**New features**

* Show information desks on trek detail maps (*requires Geotrek 0.24+*)
* Added settings ``POPUP_HOME_FORCED`` to force popup display on home (default: False)
* Add layer switcher to show satellite background (fixes #123)
* Add layer switcher to hide POIs in trek detail map (fixes #125)
* Show detail background when zooming on main map. Disable by setting
  ``TILES_MAIN_MAXZOOM`` to -1.
* Improved POIs clusters by showing thumbnails of pictograms (ref #124)
* Replaced yellow hallow by flat outline in POIs (ref #124)
* Since treks can now be published by lang, adjust navigation when a trek
  is not available in another language (fixes #148)
* Added satellite tiles to 3D view
* Added POIs markers on 3D view

**Minor features**

* Added transport icon and grouped block with access (ref #90)
* Renamed "Information" to "Lieux de renseignement" (ref #90)
* Added icon to disabled infrastructures and merged with access (ref #90)
* Removed marker jump in trek detail page (ref #124)

**Internal features**

* Empty frontend cache on sync to prevent differences between cached pages
  (ex: trek list) and AJAX data (ex: GeoJSON layer)
* Added setting to allow datasource download errors (fixes #144)
* Update Apache configuration sample to enable CORS for *Geotrek-mobile*

**Documentation**

* Add setup instructions for *Geotrek-mobile*

:notes:

    Do not forget to update your Apache configuration file

1.28 (2014-05-26)
-----------------

**BUG fixes**

* Fix GeoJSON being served as application/octet-stream (fixes #137)
* Fix GeoJSON not being gzipped : divide initialization time by four (fixes #136)
* Fix translations of Uses and Thematic (fixes #138)
* Fix translations of municipalities (fixes #107)
  (reference http://en.wikipedia.org/wiki/Municipality)
* Fix redirection to park core rules (fixes #140)

**New features**

* Feedback form from trek detail page
* Show external datasources (available in Geotrek 0.23+). Useful to show
  locations from Tourism Information Systems.
* Change 3D visualization engine, now using Babylon.js (requires Geotrek 0.23+).
* Show the whole area in 3D view (no texture yet).
* Hide empty block in detail pages if trek fields are not all filled.

**Internal features**

* Added a command to build a MBTiles file for each trek (one necessary step
  for Geotrek mobile)
* Major refactor of synchronization command, now implemented by module
* Major refactor of LESS and JavaScript code, now splitted by module
* Fix POI properties names compatible with 0.23

:notes:

    This version requires at least Geotrek 0.23, unless you set
    ``TOURISM_ENABLED`` and ``VIEW3D_ENABLED`` to ``False``.


1.27 (2014-03-20)
-----------------

**BUG fixes**

* Fix sync failure for old python versions
* Fix some pages layout bugs (fixes #75)
* Half of carousel is now active for prev and next (fixes #80)
* Fix flags images in popup
* Hide filters on page load, until Chosen is loaded (ref #61)
* Fix snippet to add extra layers in README (fixes #23, #51)
* Fix filters not being restored if both sliders are on minimum value
* Fix a bug on POIs accordion toggling
* Fix a bug on mobile backpack not showing when empty
* Remove double-slash in PDF export URL (fixes #113)

**Breaking changes**

* All national park branding has been replaced by generic Geotrek material.
  See *Customization* paragraph about images.
* Search popup is not shown outside homepage anymore. Click on *header* or
  *home* button from homepage brings it.
* No longer compatible with Django 1.4.
* Settings have been refactored to respect Django conventions.
  Local settings shall be moved to ``rando/settings`` folder, renamed to ``prod.py``,
  and this line added at the top : ``from .base import *`` (*see sample*).

**New features**

* Add icon for information desk (fixes #4)
* Range filters are now fully designed using CSS (fixes #63)
* Treks are now loaded asynchronously on home page (fixes #52)
* Most icons have been switched to vectorial font (fixes #78)
* Ascent sliders values can now be controlled via setting `FILTER_ASCENT_VALUES`.
* Difficulty sliders values are now obtained via treks attributes.
* Send a mail to admin on synchronization error, if Django mail settings
  are configured (fixes #98)


**Known problems**

* Layout problems with Internet Explorer 8 (ref #109)
* Display problems under Windows Phone 8


1.26 (2013-12-11)
-----------------

**BUG fixes**

* Fix regression about gray icons theme missing
* Prevent massive SVG elements by filtering multilinestring treks (fixes #71)

**Internal changes**

* Upgraded to Leaflet 0.7.1 (fixes #72)
* Specify user-agent header for Geotrek API calls
* Reduced page size by reducing float precision (ref #72, #38)


1.25 (2013-12-02)
-----------------

**BUG fixes**

* Fix trek layer not filtered if state passed through URL (fixes #53)
* Reset map extent on filter reset (fixes #29)
* Crop difficulty labels that wrap if too long (fixes #58)
* Hide advanced filters, then show them in JS (fixes #61)
* Fix a z-index bug on iOS Safari

**New features**

* Duration pretty format is now taken from API
* Advanced filters reordered (route) (fixes #33)
* Add tooltip on POI categories icons (fixes #26)
* POI list are not sorted by category/alphabetic, API order (progression) is kept (fixes #56)
* Add departure city in results list (fixes #57)
* Increase result thumbnail size to match height (ref #57)
* Switch parking popup to label (fixes #55)
* Add tooltips on start and end markers (fixes #25)
* Add POI label on detail map (fixes #30)
* Rework duration filter (fixes #34)
* If zoom is lower than ``TREK_LAYER_OPTIONS.iconifyZoom`` (default: 12), show treks as icons (ref #32)
* Treks are now clustered. Colors and apparence can be customized using CSS (``leaflet-marker-icon.trek-cluster``
  and ``leaflet-marker-icon.trek-icon``). *Leaflet.MarkerCluster* options can be set
  through ``TREK_LAYER_OPTIONS.clusterOptions`` (ref #32)
* Show flag on trek departure (ref #32)
* Show label on trek departure (ref #32)
* Footer content can now be translated using a file per language (see README)
* A popup can now be shown when landing on home (see README, fixes #31)
* Mobile : show print button to download pdf (fixes #28)
* Hide advanced filters, then show them in JS (ref #61)
* Filters tooltips now appended on body element (fixes #60)
* Filters label now have a fixed height (fixes #62)
* Add home popup (see README, fixes #31)
* Enable smooth scroll on mobile
* Show static map image in detail page on mobile

1.24 (2013-08-27)
-----------------

**BUG fixes**

* Fix trek detail button wraps (fixes #21)
* Fix apparence of POIs with long names (fixes #20)
* Fix positioning of advanced filters (fixes #7)

1.23 (2013-08-23)
-----------------

**Breaking changes**

* Synchronization now requires authentication (prepare for future)

:notes:
    Add ``GEOTREK_USER`` and ``GEOTREK_PASSWORD`` to your settings.

**New features**

* Add setting for page number of park policy page (fixes #14)
* Add retro-compatibility for Geotrek 0.20 altimetric profiles (fixes #11)
* Use django-leaflet 0.7.3 public version

**BUG fixes**

* Fix (again) pages ordering (fixes #759)
* Use explicit callback argument to prevent deprecation warnings (fixes #50)
* Add console to IE polyfill (fixes #47)
* Fix ResetView apparence (fixes #48)
* Upgrade MarkerCluster for Leaflet 0.6 (fixes #49)

1.22 (2013-08-13)
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
* Show map screenshot in detail page for mobile (fixes #12)
* Fixes map loading on IE8 (fixes #16)
* Fix popups on IE9 (fixes #19)
* Fix treks hovering on home page for IE (fixes #18)


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
