'use strict';

angular.module('rando.filters', [])
    .service('filtersService', require('./services').filtersService)
    .controller('GlobalFiltersController', require('./controllers').GlobalFiltersController)
    .directive('globalFilters', require('./directives').globalFiltersDirective)
    .directive('filtersTags', require('./directives').filtersTagsDirective);
