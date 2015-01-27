'use strict';

var angular = require('angular');

angular.module('rando.filters', [])
    .service('filtersService', require('./services').filtersService)
    .controller('GlobalFiltersController', require('./controllers').filtersService)
    .directive('globalFilters', require('./directives').globalFiltersDirective);