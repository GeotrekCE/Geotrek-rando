'use strict';

var angular = require('angular');

angular.module('rando.pois', [])
    .service('poisService', require('./services').poisService);