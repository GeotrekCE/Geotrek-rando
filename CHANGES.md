2.19.4-dev0
===================

**Major changes**

Some structural changes were carried out in this new version. Some of them may need you
to adjust your customizations:

* The user interface has been revamped with tabs for filtering on categories.
  This makes it *impossible* to filter on several categories at the same time anymore.
  Following this change, the `DEFAULT_ACTIVE_CATEGORIES` setting (plural) has been replaced with
  `DEFAULT_ACTIVE_CATEGORY` (singular).<br>
  - If you had customized `DEFAULT_ACTIVE_CATEGORIES` with a unique default category, you
    need to set `DEFAULT_ACTIVE_CATEGORY` to it.<br>
    _For instance:_<br>
    `"DEFAULT_ACTIVE_CATEGORIES": ["C3"]` becomes `"DEFAULT_ACTIVE_CATEGORY": "C3"`
  - If you had customized `DEFAULT_ACTIVE_CATEGORIES` with several default categories, you
    need to choose only one of them and set `DEFAULT_ACTIVE_CATEGORY` to it.<br>
    _For instance:_<br>
    `"DEFAULT_ACTIVE_CATEGORIES": ["T", "C3", "C5"]` becomes `"DEFAULT_ACTIVE_CATEGORY": "C5"`
* New translation strings were added. They have been set for English and French.
  If you use other languages, you will need to add corresponding translations.
  <br>
  Here is the list of additions:
  - `DISPLAY_MODE_MAP_LIST`: Label for the 'Map & List' view mode button.
  - `DISPLAY_MODE_MAP`: Label for the 'Map' view mode button.
  - `DISPLAY_MODE_LIST`: Label for the 'List' view mode button.
  - `DISPLAY_MODE_THUMBNAILS`: Label for the 'Thumbnails' view mode button.

**Other changes**

* The search area at the top of the map was removed (as it's now below category filters).
* The filter drawing at the bottom of the map has been removed.
* New option: `DEFAULT_VIEW_MODE` to select what view mode should be displayed by
  default. See documentation for further details.

2.19.3 / 2018-08-31
===================

**Bug fixes**

* Fix some translations

2.19.2 / 2018-08-22
===================

**Bug fixes**

* Fix themes translation when switching language

2.19.1 / 2018-07-27
===================

**Bug fixes**

* Fix back to map spinner

2.19.0 / 2018-06-28
===================

**Enhancements**

* Allow to link a district from the home page

2.18.1 / 2018-05-02
===================

**Enhancements**

* Show sensitive areas
* Upgrade jQuery and bootstrap-daterangepicker npm modules
* Create an empty directive allowing to add custom code
  through custom directive file

**Bug fixes**

* Events finishing today should not be filtered out
* Improve documentation (npm version, nginx config dir, facebook config)
* Deinit 3D module when leaving
* Stop toggling POI panels whenever they get reloaded if one's already open (#584)

2.18.0 / 2017-12-21
===================

**WARNING!**

If you upgrade from a previous version, don't forget to upgrade nodejs (see
.nvmrc file) before and remove node_modules directory before running npm
install. Please update your nginx configuration too if you want to share
with Facebook.

**Enhancements**

* Update recommanded nodejs version to 6.11.5 (LTS)
* Do a bunch of modules upgrades to insure ensure forward
  compatibility and improve build performance
* Replace facebook feed method (deprecated) by share method
  (requires Geotrek-admin 2.16.0+)

2.17.1 / 2017-09-28
===================

**Bug fixes**

* Show legend as link text for POI media other than images

2.17.0 / 2017-09-25
===================

**Enhancements**

* Add an option allowing fiBounds when centering on marker
* Add trek length in result list
* Add spanish translation
* Update italian translation

**Bug fixes**

* Replace Mapbox copyright by IGN

2.16.2 / 2017-06-21
===================

**Bug fixes**

* Fix altimetric profile when going on a detail page again

2.16.1 / 2017-06-15
===================

**Bug fixes**

* Fix URLs in README
* Fix it translation

2.16.0 / 2017-06-15
===================

**Enhancements**

* Add a function to switch to specific category and routes from home page

2.15.1 / 2017-05-31
===================

**Bug fixes**

* Fix language switcher on home page (workaround with reloading)
* Fix de translation

2.15.0 / 2017-03-09
===================

**Enhancements**

* Add a config option allowing to randomize results display

2.14.11 / 2017-03-01
====================

**Bug fixes**

  * Fix media player

2.14.10 / 2016-09-26
====================

**Bug fixes**

  * Fix services controller icon display

2.14.9 / 2016-09-15
===================

**Bug fixes**

  * Disable click on path on warning map
  * Fix arrow position between main map an list

2.14.8 / 2016-09-14
===================

**Bug fixes**

  * Prevent null value to be added to default category properties

**Enhancements**

  * Refactor warning map service and show trek

2.14.7 / 2016-06-27
==================

**Bug fixes**

  * Uncomment line to execute initShareOnTranslate() on all pages
  * Add !default to categories colors to allow configuration

**Enhancements**

  * Move filter by map button from bottom left to up left

2.14.6 / 2016-06-22
==================

**Bug fixes**

  * Fix path to lightbox-gallery template
  * Change length translation


2.14.5 / 2016-06-09
==================

**Bug fixes**

  * Fix warning icon size/position


2.14.4 / 2016-06-08
==================

**Bug fixes**

  * Revert bad fix orthophoto url for 3d


2.14.3 / 2016-06-07
==================

**Bug fixes**

  * Allow access to filtered results from any page
  * Fix main content height on IOS


2.14.2 / 2016-05-11
==================

**Enhancements**

  * Sequential loading for markers pois and services types icons


2.14.1 / 2016-03-16
==================

**Enhancements**

  * Use `ORTHOPHOTO_TILELAYERS` as layer for rando-3d

**Bug fixes**

  * Fix test dataset (add limits to profile.json)
  * Avoid crash when no services.geojson
  * Avoid crash when dataset do not fills requirements
  * Fix detail aside items opacity
  * Fix custom path in documentation
  * Fix rando3d image path
  * Bundle template for rando-3d

2.14.0 / 2016-03-11
==================

**Major change**

  * Create an empty `custom/` directory if none
  * Only ignore `/dist/`(from root)
  * No need to ignore anything from `src/` anymore
  * Add `public/` directory level for dist & customs
  * Add a symlink in webroot to public files from `custom/`directory
  * Adjust http paths for custom templates
  * Replace `*-custom.po` files by a `custom-po` symlink to `/custom/po`
    * Custom `.po` files should not include `custom` in there filename anymore.
  * Adjust `.gitignore`, all bundles are created into `dist/`
  * Put `.gitignore` rule about `!.gitkeep` at the end of file
  * Renames SCSS files `_config-custom` & `_config-default` to `_configuration` & `_configuration.default`
  * Bundle home default template at build time
  * Bundle footer default template at build time
  * Bundle header default template at build time
  * Rename `build.js` gulp task to `js-bundle.js`
  * Use `public` as webroot directory instead of `src`
  * Move `tests` directory one level up
  * Create `public` directory and put static files in it
  * Change target dir for bundles (scripts, styles, translations)
  * Init `dist` directory
  * Delete now useless `config.js`
  * Don't concat scss files before compiling
  * Merge `settings.custom` & `settings.default` at runtime

**Enhancements**

  * Update image path from docs
  * Adapt `README.md` to forward user to new doc about settings
  * Adjust documentation to match new directories structure
  * Allow to use a symlink as custom files directory
  * Change default path for custom images
  * Remove unused `vendors` task
  * Shrink gulp translate task
  * Unfactorize config for tests task
  * Unfactorize config for rando3D.js task
  * Unfactorize config for sass task
  * Remove unused gulp task & npm dependencies
  * Remove useless code blocks & unused vars
  * Simplify required conf files creation


2.13.1 / 2016-03-10
==================

**Bug fixes**

  * Fix `stylesConfigService` condition for trek color path
  * Fix loading of `rando-3D.js` in HTML5 mode
  * Fix `isConfigAvailable` condition

2.13.0 / 2016-03-04
==================

**New features**

  * Generate custom colors CSS in js to allow customisation with Geotrek Admin
  * Add `tinycolor` to customise color render in js
  * Add categories colors and primary color classes in templates for new styles
  * Set a condition for all css style with `$category` and `$primary-color` : only if `$json-custom-style` is true
  * Set `isConfigAvailable` to false to disable style generation (for retrocompatibility)

2.12.1 / 2016-03-04
==================

**Bug fixes**

  * Fix home filtering
  * Set favorite category icons width and height to 100%

2.12.0 / 2016-03-03
==================

**New features**

  * Close global filters aside on click outside

**Enhancements**

  * Refactor isOnMap service

**Bug fixes**

  * Fix filter by map button
  * Avoid filter by map when button is checked
  * Fix header mobile menu on ios

2.11.1 / 2016-03-01
==================

**Bug fixes**

  * Fix loader on flat pages


2.11.0 / 2016-02-29
==================

**Bug fixes**

  * Fix collapser counters ie10
  * Fix steps markers centering ie10
  * Fix category icon size on detail page
  * Fix search icon color on mobile
  * Fix search icon on mobile
  * Change loader style and show it when update filters
  * Fix tooltip bug wih category icon in results
  * Fix nginx config example in README
  * Fix node version in README
  * Change fullscreen size to avoid map on detail pane background. Remove useless css

**Enhancements**

  * JS for 3D in a separate script
  * Optimize header dropdowns height
  * Add tooltips on categories and themes solo icons
  * Force size of pictograms and remove useless styles and some ng-include svg
  * Put email field in contact card
  * Remove the pin for POI types in default customization file. Set a default icon size of 32x32 pixels.
  * Changed mobile header switch icon

2.10.0 / 2016-02-25
==================

**Major change**

  * Update rando3D library, add gulp task for external script rando-3D

**New features**

  * Add previous and next steps buttons on detail page
  * Order steps by number
  * Contextualise parent for detail view
  * Add condition in steps controller for tests
  * Replace category/use picto with step number for list element if children
  * Set step number in controller instead of map service
  * Add number in steps markers on detail map
  * Add a directive to close menu on click everywhere except on the menu

**Enhancements**

  * Use sass var for font family
  * Remove useless style
  * Remove blue border and white background from services icon
  * Add a paragraph in doc to redirect urls from v1

**Bug fixes**

  * Fix pois english translation
  * Allow cluster on detail page
  * Fix ref points style
  * Fix close menu button position

2.9.0 / 2016-02-23
==================

**New features**

  * Doc: Init the `contribute.md` page

**Enhancements**

  * Remove outline on rzslider focus
  * Upgrade angular-slider with last upstream version
  * New module for loader
  * Show toggle all categories checkbox by default
  * Replace "Commune de départ" by "Commune"

**Bug fixes**

  * Change loader style
  * Fix results list loading

2.8.10 / 2016-02-19
==================

**Enhancements**

  * Replace facebook share link by sdk
  * Remove useless comment
  * Add english translation for DATE_FILTER

**Bug fixes**

  * Replace leaflet.fullscreen by leaflet-fullscreen
  * Add external links in flat pages menu
  * Change z-index to 2147483647 (max z-index number)

2.8.9 / 2016-02-16
==================

**Bug fixes**

  * Fix `_.uniq` to `_.uniqBy` upgrade

2.8.8 / 2016-02-15
==================

**Enhancements**

  * Update a bunch of npm dependencies
  * Remove dependency to `lodash.assign` using `lodash/assign` instead
  * Upgrade `lodash` dependency to 4.3.0
  * Upgrade `karma-phantomjs-launcher` dependency to 1.0.0

2.8.7 / 2016-02-15
==================

**Enhancements**

  * Update `package.json` dependencies versions (no changes in shrinkwrap)
  * Merge dependencies & devDependencies from package.json
  * Remove dependency to `browser-sync`
  * Replace deprecated `gulp-karma` by `karma`
  * Remove useless dependency
  * Lint `package.json` file
  * Update npm-shrinkwrap

2.8.6 / 2016-02-15
==================

**Bug fixes**

  * Adjust icons url from relative to absolute

2.8.5 / 2016-02-12
==================

**Enhancements**

  * Better management of pictures height in result list

**Bug fixes**

  * Switching language now close categories menu
  * Use a local version of jQuery.scrollTo to avoid loading dependency
  * Convert `data-src` to `src` when opening popups

2.8.4 / 2016-02-11
==================

**Bug fixes**

  * Fix content listing from detail page
  * Add `lazy-check` for aside contents

2.8.2 / 2016-02-09
==================

**Enhancements**

  * Create npm-shrinkwrap to lock packages versions
  * Fix npm dependencies coming from git with commit hash

**Bug fixes**

  * Change modules order to avoid overriding L

2.8.1 / 2016-02-09
==================

**Bug fixes**

  * Do not disable transitions globally
  * Fix structures filter

2.8.0 / 2016-02-09
==================

**Bug fixes**

  * Init `self._trekList` as Objet instead of Array
  * Replace irregular whitespaces
  * Use a previously declared `lang` var

**Enhancements**

  * Add eslintrc rule to avoid warning on console.log
  * Allow early return if any required filter returns false
  * Remove redundant var init
  * Use `$q.when` instead of creating a Defer object for returning it immediately
  * Use $http service instead of $resource for fetching Treks/Contents/Events
  * Do not delay resetting promise cache
  * Add a comments
  * Use private (instead of public) var for storing getSVGIcon promises
  * Better use of `lang` var for storing contents
  * Add initialization for `_categoriesList`
  * Add argument for filtering specific language contents
  * Rename method to avoid confusion with `filtersService`
  * Add condition to `simpleEach` to avoid exceptions
  * ESLint correction pass

**Performance enhancements**

  * Use service var instead of argument for preprocessing Treks/Contents/Events
  * Refactor `getCategoriesIcons` method
  * Debounce `getCategoryIcon` getter calls
  * Debounce `getCategories` getter calls
  * Debounce `getFilteredResults` getter calls
  * Use $http service instead of $resource for fetching Treks/Contents/Events/Cat icons
  * Use independent storage for each language for categories
  * Use current language for storing promises of `getCategories`
  * Add comments and move IDs setup to top in `refactorTrek`
  * Use a categories preprocess instead of one more promise chaining

  * Use a storage in `$rootScope` for each language in `resultsService`
  * Use `$rootScope` variable for displaying results
  * Adapt `mapServices` to `$rootScope` results storage
  * Store counts of results & display it
  * Now caching inside each content the filtering result
  * Adjust e2e tests
  * Add default placeholder to results

  * Use lazy loading for results themes icon
  * Avoid injecting non-used service
  * Remove style attribute for placeholder picture
  * Create a directive for lazy loading pictures with data-src

  * Disable CSS transitions when there are more than 100 contents
  * Add argument for getting specific language contents

  * Add an angular service for cleaning filters object from empty values
  * Maintain a strict ordering for `activeFilters`, allowing pseudo-footprint

2.7.6 / 2016-02-02
==================

**Enhancements**

  * Debounce contents getter calls && use a storage for each language
  * Avoid a useless object merge
  * Add marker layers only once to clustering layers
  * Add `ngNonBindable` for #map
  * Use bind-once for result items cards fields
  * Use $http service instead of $resource for fetching SVG
  * Debounce getSVGIcon calls
  * Debounce getCategoriesIcons calls
  * Debounce displayResults calls
  * Use onetime binding for results list items translations
  * Remove useless listener on nearMarkers
  * Avoid multiple event bind for resultsVisibility

**Bug fixes**

  * Quick fix: avoid `undefined` value for forceRefresh arg

2.7.5 / 2016-02-01
==================

**New features**

  * Init a new browsable documentation
  * Add a PNG version of main logo

**Bug fixes**

  * force warning panel to close on route change

2.7.4 / 2016-01-29
==================

**Enhancements**

  * Move marker created from optional geoJSON layers to back
  * Add a simple npm command to checkout origin/latest
  * Update package.json version number to match current release tag

**Bug fixes**

  * Move map controls in fullscreen only accordingly to current map state

2.7.3 / 2016-01-29
==================

**Enhancements**

  * Use L.icon config for geoJSON layer custom icon
  * Remove useless dependency to gulp-streamify
  * Remove useless function

2.7.2 / 2016-01-28
==================

**Bug fixes**

  * Don't pollute rootScope with local scope vars
  * Cleanup rootScope event when destroying warning controller
  * Remove useless console.log
  * Fixed collapser in asides

**New features**

  * Manage popup for geoJson layer with associate properties

2.7.1 / 2016-01-27
==================

**Bug fixes**

  * Fixed warning marker icon position

**Enhancements**

  * Add default leaflet config in map service

2.7.0 / 2016-01-27
==================

**Bug fixes**

  * fix ie map controllers position
  * Change $state.go to $state.transitionTo to prevent controller reload on switch lang
  * Force angular digest after setting rootscope var
  * Add specific ie rule for map right controllers position in fullscreen

**Enhancements**

  * Change translation for date filter title
  * Add tests for map detail page
  * Adapt CHANGES.md style to `hub changelog` style

**New features**

  * Add a way to manage a "always active" layer

2.6.1 / 2016-01-26
==================

**Bug fixes**

  * Fixed categories menu scroll system

**Enhancements**

  * Replaced datepicker clear button with a cross inside the input

2.6.0 / 2016-01-26
==================

**Bug fixes**

  * Create elevation profile only for treks
  * Force services to use cache
  * Always cache requests in pois service
  * Do not force refresh of pois icons on each call

**Enhancements**

  * Remove useless argument from function call
  * Remove useless dependencies
  * Use 'update' instead of 'install' with npm
  * Add TravisCI specific dependencies to use Node >4
  * Use .nvmrc node version for TravisCI

2.5.0 / 2016-01-22
==================

**Bug fixes**

  * Fix style aside pane on safari and firefox
  * Fix translation typo
  * Add page url on twitter share link
  * Fix style aside content for ipad

**Enhancements**

  * Adjust tests to match new categories menu markup
  * Better way to hide sidebar of categories list
  * Add a 'CSS browser selector' like library to add conditional classes to `<html>` tag

2.4.4 / 2016-01-22
==================

**Bug fixes**

  * Map controls style on fullscreen and fold-aside
  * Fullscreen style (change selector to apply only on aside)
  * Load initFilters() call in rootScopeEvents to prevent filters disappearing
  * Add 'close' translation
  * Disable center on detail page - need to improve centerService
  * Redirect to home if content not available in selected language
  * Fix poi svg error on switch language
  * add option to state.go to avoid reload page
  * Add forceRefresh and fix map controller

**Enhancements**

  * Enable scrolling categories icon whith small viewport height
  * Change function order to avoid lint errors
  * Change forceRefresh option on some controllers
  * set forceRefresh option and remove useless elements

2.4.3 / 2016-01-21
==================

**Hot fixes**

  * Hot fix to avoid map crash when switching language

**Bug fixes**

  * Adjust favicon path for detail page

**New Features**

  * Add rootScope.lang in html tag

2.4.2 / 2016-01-21
==================

**New Features**

  * New datepicker
  * Adapt text and translations for single datepicker
  * Change datepicker directive by daterangepicker

2.4.1 / 2016-01-20
==================

**Bug fixes**

  * Debug miniMap zoom limits overriding main map zoom limits
  * Remove dependency to <base> tag to allow xlink:href of SVG when using html5mode
  * Fix lint errors

**New Features**

  * Adjust .gitignore so we do not create useless empty dir
  * Add .nvmrc file to have a reference to the most preferable version of Node
  * Command 'npm run export' now resolve symlinks

2.3.1 / 2016-01-15
==================

**Bug fixes**

  * Add test to check if language in local storage is not a json

2.3.0 / 2016-01-15
==================

**Redesign**

  * Complete rebuild of UI look & feel

**Bug fixes**

  * A lot of things

2.2.1 / 2015-11-18
==================

**Bug fixes**

  * fixed results list item responsive
  * better responsive for themes filters
  * update parents display and options for new API

2.2.0 / 2015-11-05
==================

**Breaking changes**

  * `SHOW_HOME` is now to `true` by default in order to test home page. You need to set it to false if you didn't have a home page

**New Features**

  * Add random content widget and method
  * Add random contents widgets on default home page
  * Remove system dependency to gulp by using npm scripts (npm run)
  * Add a gulp task helping extraction of customization files
  * Add select filters auto-closing option

**Bug fixes**

  * Type 1 and 2 categories filters should always be last on the list
  * Remove useless spaces in categories filters template
  * Fixed results ordering

2.1.0 / 2015-10-08
==================

**New Features**

  * Changed configuration method allowing to override only what is needed and offerring easier customisation and maintainability.
  * New warning module allowing users to send a message to Geotrek Admin.
  * Show services (trek info) on map
  * Add a setting to check "Filter with map" by default
  * Add function to get random element from a category
  * Events are displayed after other elements on lists
  * Add picto to bookmarks elements (fixes #342)
  * Sort bookmarks by name (fixes #343)
  * Enable map constraints to defined bounds (fixes #8770)
  * Add date filters for touristic events
  * Add optional tiles layers support
  * Flatten altimetric profile
  * Various other improvements…

**Bug fixes**

  * Fix path of png pictograms for type1/type2
  * Prevent horizontal scroll bar to show on favorite dropdown
  * Fixed issue with lang if no favoriteLang
  * Fixed services map control images path
  * Fixed satellite view with tileLayers
  * Various other fixes…

**How to update**

Because of the new configuration system, few files had their contents and names changed.
You will need to:

  * Backup your old configs and custom files
  * Update your repository (either using git or downloading an archive)
  * Update your config
    * go to `src/app/config` folder
    * duplicate the `settings.default.json` file and rename it `settings.custom.json`
    * in this file `settings.custom.json` you need to change variables according to your old file `config.js`
    * remove all the variables that are not different from the default file you've copied
    * remove your old `configs.js` file
  * Update your style config
    * go to `src/app/config/styles` folder
    * rename your `_config.scss` to `_config-custom.scss`
  * Update your style override
    * go to `src/app/custom/styles`
    * remove `_custom.scss` file if it exists
  * Update your languages customisation
    * go to `src/app/translation/po`
    * you should see folders for each lang and your old `lang-custom.po` files
    * put your old `lang-custom.po` files in respective folder (ex: `fr-custom.po` goes into the `fr` folder)


2.0.0 / 2015-07-20
==================

**Initial release of v2**

Geotrek-rando V2 has been totally redesigned from scratch with AngularJS, to be full JS. This allows to host it on a shared hosting or a CDN.

It requires Geotrek-admin version 2.X and can't be synchronised with Geotrek-admin v0.X and v1.X.

Geotrek-rando v1 is available at https://github.com/GeotrekCE/Geotrek-rando/tree/v1.X
