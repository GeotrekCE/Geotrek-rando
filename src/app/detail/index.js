'use strict';

var angular = require('angular');

angular.module('rando.detail', ['ui.bootstrap', 'pascalprecht.translate'])
    .config(require('./lang').translateDetails)
    .controller('DetailController', require('./controllers').DetailController)
    .directive('detailPage', require('./directives').detailDirective);