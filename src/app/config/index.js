'use strict';

angular.module('rando.config', [])
    .constant('globalSettings', {
        DEFAULT_LANGUAGE: 'fr'
    })
    .factory('settingsFactory', require('./factories').settingsFactory);