'use strict';

var angular = require('angular');

angular.module('rando.detail', ['ui.bootstrap'])
    .controller('DetailController', require('./controllers').DetailController)
    .directive('detailPage', require('./directives').detailDirective);