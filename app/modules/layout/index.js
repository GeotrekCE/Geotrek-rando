'use strict';

var angular = require('angularCommon');

angular.module('rando.layout', ['ui.router', 'rando.treks'])
    .config(require('./routes').layoutRoutes)
    .run(require('./services').RunApp);