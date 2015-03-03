'use strict';

var angular = require('angular');

angular.module('rando.layout', ['ui.router', 'rando.treks'])
    .config(require('./routes').layoutRoutes)
    .config(require('./lang').translateLayout)
    .run(require('./services').RunApp);