'use strict';

var angular = require('angular');

angular.module('rando.near', [])
    .controller('NearListeController', require('./controllers').NearListeController)
    .directive('nearListe', require('./directives').nearListeDirective);