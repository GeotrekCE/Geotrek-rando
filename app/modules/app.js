'use strict';

var dependencies = [
    // Our submodules
    'rando.config', 'rando.treks', 'rando.layout',

    // External stuff
    'ui.router', 'ngResource'
];

var angular = require('angularCommon');
angular.module('geotrekRando', dependencies);


// Require Geotrek components
require('angular-ui-router');
require('angular-resource');

// Require Geotrek components
require('./config');
//require('./commons');
require('./layout');
require('./treks');
//require('./map');
