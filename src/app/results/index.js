'use strict';

var angular = require('angular');

angular.module('rando.results', [])
    .service('resultsService', require('./services').resultsService)
    .controller('ResultsListeController', require('./controllers').ResultsListeController)
    .controller('TagsFiltersController', require('./controllers').TagsFiltersController)
    .directive('resultsListe', require('./directives').resultsListeDirective)
    .directive('filtersTags', require('./directives').tagsFiltersDirective);