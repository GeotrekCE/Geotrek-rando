'use strict';

var dependencies = [
    // Our submodules
    'rando.config',
    'rando.commons',
    'rando.treks',
    'rando.pois',
    'rando.layout',
    'rando.map',
    'rando.filters',
    'rando.touristics',
    'rando.categories',
    'rando.results',
    'rando.detail',
    'rando.favorites',
    'rando.gallery',


    // External stuff
    'ui.router',
    'ui.slider',
    'ngResource',
    'ui.bootstrap',
];

var angular = require('angular');
window._ = require('lodash');
window.jQuery = require('jquery');
window.L = require('leaflet');

// Load external dependencies
require('ui.bootstrap');
require('ui.router');
require('angular-slider');
require('ngResource');
require('bootstrap');
require('leaflet-minimap');
require('leaflet.markercluster');
require('leaflet.fullscreen');
require('angular-mocks'); // that one will exclude if not angular.mock

angular.module('geotrekRando', dependencies);

// Require Geotrek components
require('./config');
require('./commons');
require('./layout');
require('./treks');
require('./pois');
require('./touristics');
require('./results');
require('./categories');
require('./filters');
require('./map');
require('./detail');
require('./favorites');
require('./gallery');
