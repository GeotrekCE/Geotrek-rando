'use strict';

var angular = require('angular');

angular.module('rando.filters', [])
    .service('filtersService', require('./services').filtersService);