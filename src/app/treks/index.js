'use strict';

angular.module('rando.treks', [])
    .service('treksService', require('./services').treksService)
    .controller('TreksListeController', require('./controllers').TreksListeController)
    .directive('treksListe', require('./directives').treksListeDirective);