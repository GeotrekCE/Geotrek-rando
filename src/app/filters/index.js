'use strict';

angular.module('rando.filters', [])
    .service('filtersToolsService', require('./services').filtersToolsService)
    .service('filtersService', require('./services').filtersService)
    .controller('GlobalFiltersController', require('./controllers').GlobalFiltersController)
    .controller('FiltersTagsController', require('./controllers').FiltersTagsController)
    .directive('globalFilters', require('./directives').globalFiltersDirective)
    .directive('filtersTags', require('./directives').filtersTagsDirective);
