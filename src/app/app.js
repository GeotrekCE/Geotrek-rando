'use strict';

var dependencies = [
    // OUR SUBMODULES
    'rando.config',
    'rando.translation',
    'rando.commons',
    'rando.treks',
    'rando.pois',
    'rando.services',
    'rando.items',
    'rando.layout',
    'rando.header',
    'rando.footer',
    'rando.leafletextend',
    'rando.icons',
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
    'rando.warning',
    'rando.googleapi',

    // EXTERNAL STUFFS
    'pascalprecht.translate',
    'angular-google-analytics',
    'ui.router',
    'rzModule',
    'ngResource',
    'ui.bootstrap'
];

var angular = require('angular');
window._ = require('lodash');

window.jQuery = require('jquery');

window.L = require('leaflet');
window.L.pip = require('leaflet-pip');

window.rando3D = require('rando3d');

require('classlist-polyfill');

require('jquery.scrollto');

// LOAD EXTERNAL DEPENDENCIES
require('ui.bootstrap');
require('ui.router');
require('angularjs-slider');
require('angular-translate');
require('angular-google-analytics');
require('ngResource');
require('bootstrap');
require('sparklines');

//MAP LIBRARIES
require('leaflet-ajax');
require('leaflet-textpath');
require('leaflet-minimap');
require('leaflet.markercluster');
require('leaflet.fullscreen');
require('leaflet-geometryutil');
require('leaflet-active-area');

//TEST LIBRARIES
require('angular-mocks'); // that one will exclude if not angular.mock


//INIT APP
angular.module('geotrekRando', dependencies);

// REQUIRE APP COMPONENTS
require('./config');
require('./translation');
require('./commons');
require('./header');
require('./footer');
require('./layout');
require('./treks');
require('./pois');
require('./services');
require('./items-list');
require('./touristics');
require('./results');
require('./categories');
require('./filters');
require('./icons');
require('./leaflet-extend');
require('./map');
require('./detail');
require('./favorites');
require('./gallery');
require('./home');
require('./social');
require('./3d');
require('./flat-pages');
require('./custom');
require('./warning');
require('./googleapi');
