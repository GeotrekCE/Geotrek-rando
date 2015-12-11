'use strict';

angular.module('rando.rando3D', [])
    .controller('Rando3DController', require('./controllers').Rando3DController)
    .directive('rando3d', require('./directives').rando3dDirective)
    .service('webglService', require('./services').webglService);
