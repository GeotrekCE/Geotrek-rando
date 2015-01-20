'use strict';

var angular = require('angular');

angular.module('rando.commons', [])
    .factory('utilsFactory', require('./factories').utilsFactory);