'use strict';

var angular = require('angular');

angular.module('rando.filters', [])
    .config(require('./lang').translateFilters)
    .service('filtersService', require('./services').filtersService)
    .controller('GlobalFiltersController', require('./controllers').GlobalFiltersController)
    .directive('globalFilters', require('./directives').globalFiltersDirective)
    .directive('filtersTags', require('./directives').filtersTagsDirective);