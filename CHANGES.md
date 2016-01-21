# CHANGELOG

2.4.2 / 2016-01-21
------------------

**New Features**

  * New datepicker
  * Adapt text and translations for single datepicker
  * Change datepicker directive by daterangepicker

2.4.1 / 2016-01-20
------------------

**Bug fixes**

  * Debug miniMap zoom limits overriding main map zoom limits
  * Remove dependency to <base> tag to allow xlink:href of SVG when using html5mode
  * Fix lint errors

**New Features**

  * Adjust .gitignore so we do not create useless empty dir
  * Add .nvmrc file to have a reference to the most preferable version of Node
  * Command 'npm run export' now resolve symlinks

2.3.1 / 2016-01-15
------------------

**Bug fixes**

* Add test to check if language in local storage is not a json

2.3.0 / 2016-01-15
------------------

**Redesign**

* Complete rebuild of UI look & feel

**Bug fixes**

* A lot of things

2.2.1 (2015-11-18)
------------------

**Bug fixes**

* fixed results list item responsive
* better responsive for themes filters
* update parents display and options for new API

2.2.0 (2015-11-05)
------------------

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

2.1.0 (2015-10-08)
------------------

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


2.0.0 (2015-07-20)
------------------

**Initial release of v2**

Geotrek-rando V2 has been totally redesigned from scratch with AngularJS, to be full JS. This allows to host it on a shared hosting or a CDN.

It requires Geotrek-admin version 2.X and can't be synchronised with Geotrek-admin v0.X and v1.X.

Geotrek-rando v1 is available at https://github.com/makinacorpus/Geotrek-rando/tree/v1.X
