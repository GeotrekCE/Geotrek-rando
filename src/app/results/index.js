'use strict';

var angular = require('angular');

angular.module('rando.results', [])
    .controller('ResultsListeController', require('./controllers').ResultsListeController)
    .directive('resultsListe', require('./directives').resultsListeDirective);