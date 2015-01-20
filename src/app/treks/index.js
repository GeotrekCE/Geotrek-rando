'use strict';

var angular = require('angular');

angular.module('rando.treks', [])
    .service('treksService', require('./services').treksService);