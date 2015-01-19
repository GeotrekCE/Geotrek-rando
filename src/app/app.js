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


    // External stuff
    'ui.router',
    'ngResource'
];

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
