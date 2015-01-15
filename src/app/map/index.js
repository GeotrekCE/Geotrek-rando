'use strict';

angular.module('rando.map', [])
    .service('mapService', require('./services').mapService)
    .controller('MapController', require('./controllers').MapController)
    .directive('geotrekMap', require('./directives').mapDirective);