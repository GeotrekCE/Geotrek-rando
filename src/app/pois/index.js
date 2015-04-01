'use strict';

var angular = require('angular');

angular.module('rando.pois', [])
    .service('poisService', require('./services').poisService)
    .controller('PoisListeController', require('./controllers').PoisListeController)
    .controller('MediaController', require('./controllers').MediaController)
    .directive('poisListe', require('./directives').poisListeDirective);