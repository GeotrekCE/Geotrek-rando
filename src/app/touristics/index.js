'use strict';

angular.module('rando.touristics', [])
    .service('contentsService', require('./services').contentsService)
    .service('eventsService', require('./services').eventsService);
