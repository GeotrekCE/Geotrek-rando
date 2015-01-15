'use strict';

var dependencies = [
    // Our submodules
    'rando.config', 'rando.treks', 'rando.layout', 'rando.map',

    // External stuff
    'ui.router', 'ngResource'
];

angular.module('geotrekRando', dependencies);

// Require Geotrek components
require('./config');
//require('./commons');
require('./layout');
require('./treks');
require('./map');
