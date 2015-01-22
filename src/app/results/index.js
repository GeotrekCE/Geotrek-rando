'use strict';

var angular = require('angular');

angular.module('rando.results', [])
    .service('resultsService', require('./services').resultsService)
    .controller('ResultsListeController', require('./controllers').ResultsListeController)
    .directive('resultsListe', require('./directives').resultsListeDirective);