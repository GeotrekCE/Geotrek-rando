'use strict';

var angular = require('angular');

angular.module('rando.layout', ['ui.router', 'rando.treks', 'angular-google-analytics'])
    .config(require('./routes').layoutRoutes)
    .config(require('./lang').translateLayout)
    .config(require('./analytics').AnalyticsConfig)
    .run(['Analytics', function (Analytics) {}]) // !!! Analytics needs to be injected once in order to be active !!!
    .run(require('./services').RunApp);