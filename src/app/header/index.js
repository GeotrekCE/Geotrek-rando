'use strict'

var angular = require('angular');

angular.module('rando.header', [])
    .directive('randoHeader', require('./directives').randoHeader);