'use strict';

var dependencies = [
    // OUR SUBMODULES
    'rando.config',
    'rando.translation',
    'rando.commons',
    'rando.treks',
    'rando.pois',
    'rando.near',
    'rando.filiation',
    'rando.layout',
    'rando.footer',
    'rando.map',
    'rando.filters',
    'rando.touristics',
    'rando.categories',
    'rando.results',
    'rando.detail',
    'rando.favorites',
    'rando.gallery',
    'rando.home',
    'rando.rando3D',
    'rando.flat',
    'rando.social',
    'rando.custom',

    // EXTERNAL STUFFS
    'pascalprecht.translate',
    'angulartics',
    'angulartics.google.analytics',
    'ui.router',
    'ui.slider',
    'ngResource',
    'ui.bootstrap'
];

var angular = require('angular');
window._ = require('lodash');
window.jQuery = require('jquery');
window.L = require('leaflet');
window.rando3D = require('rando3d');
require('classlist-polyfill');

// LOAD EXTERNAL DEPENDENCIES
require('ui.bootstrap');
require('ui.router');
require('angular-slider');
require('angular-translate');
require('angulartics');
require('angulartics-ga');
require('ngResource');
require('bootstrap');
require('sparklines');

//MAP LIBRARIES
require('leaflet-minimap');
require('leaflet.markercluster');
require('leaflet.fullscreen');
require('leaflet-geometryutil');

//TEST LIBRARIES
require('angular-mocks'); // that one will exclude if not angular.mock


//INIT APP
angular.module('geotrekRando', dependencies);

// REQUIRE APP COMPONENTS
require('./config');
require('./translation');
require('./commons');
require('./footer');
require('./layout');
require('./treks');
require('./pois');
require('./near-elements');
require('./filiation');
require('./touristics');
require('./results');
require('./categories');
require('./filters');
require('./map');
require('./detail');
require('./favorites');
require('./gallery');
require('./home');
require('./social');
require('./3d');
require('./flat-pages');
require('./custom');