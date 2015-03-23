'use strict';

var angular = require('angular');

angular.module('rando.rando3D', [])
    .controller('Rando3DController', require('./controllers').Rando3DController)
    .directive('rando3d', require('./directives').rando3dDirective);