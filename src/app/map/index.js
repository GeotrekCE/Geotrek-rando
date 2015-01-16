'use strict';

angular.module('rando.map', [])
    .service('mapService', require('./services').mapService)
    .service('iconsService', require('./services').iconsService)
    .controller('MapController', require('./controllers').MapController)
    .directive('geotrekMap', require('./directives').mapDirective);