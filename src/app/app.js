'use strict';

var dependencies = [
    // Our submodules
    'rando.config',
    'rando.commons',
    'rando.treks',
    'rando.layout',
    'rando.map',
    'rando.filters',
    'rando.touristics',
    'rando.categories',
    'rando.results',
    'rando.detail',


    // External stuff
    'ui.router',
    'ngResource'
];

var angular = require('angular');
window._ = require('lodash');
window.jQuery = require('jquery');
window.L = require('leaflet');

// Load external dependencies
require('ui.router');
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
require('./touristics');
require('./results');
require('./categories');
require('./filters');
require('./map');
require('./detail');
