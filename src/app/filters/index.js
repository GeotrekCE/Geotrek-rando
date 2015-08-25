'use strict';

angular.module('rando.filters', [])
    .service('filtersService', require('./services').filtersService)
    .controller('GlobalFiltersController', require('./controllers').GlobalFiltersController)
    .controller('FiltersTagsController', require('./controllers').FiltersTagsController)
    .directive('globalFilters', require('./directives').globalFiltersDirective)
    .directive('filtersTags', require('./directives').filtersTagsDirective);
