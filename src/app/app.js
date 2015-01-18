'use strict';

var dependencies = [
    // Our submodules
    'rando.config',
    'rando.treks',
    'rando.layout',
    'rando.map',
    'rando.filters',
    'rando.touristics',
    'rando.categories',


    // External stuff
    'ui.router',
    'ngResource'
];

angular.module('geotrekRando', dependencies);

// Require Geotrek components
require('./config');
//require('./commons');
require('./layout');
require('./treks');
require('./touristics');
require('./categories');
require('./filters');
require('./map');
