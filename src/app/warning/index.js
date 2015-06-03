'use strict'

var angular = require('angular');

angular.module('rando.warning', [])
    .directive('warningPanel', require('./directives').warningPanelDirective);