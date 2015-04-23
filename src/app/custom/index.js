'use strict';

var angular = require('angular');

angular.module('rando.custom', ['ui.router', 'ui.bootstrap']);

require('./services');
require('./controllers');
require('./directives');