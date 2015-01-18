'use strict';

angular.module('rando.config', [])
    .constant('globalSettings', require('./configs').constants)
    .factory('settingsFactory', require('./factories').settingsFactory)
    .config(require('./configs').providersConfig);