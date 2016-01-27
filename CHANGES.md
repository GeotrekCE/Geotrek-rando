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

Geotrek-rando v1 is available at https://github.com/makinacorpus/Geotrek-rando/tree/v1.X
