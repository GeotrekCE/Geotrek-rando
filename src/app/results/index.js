'use strict';

angular.module('rando.results', [])
    .controller('ResultsListeController', require('./controllers').ResultsListeController)
    .directive('resultsListe', require('./directives').resultsListeDirective);