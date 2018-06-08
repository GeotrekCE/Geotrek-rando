'use strict';

var _ = require('lodash');

angular.module('rando.config', [])
    .constant('globalSettings', require('./globalSettings'))
    .config(require('./providers.config').providersConfig)
    .factory('settingsFactory', require('./factories').settingsFactory)
    .service('stylesConfigService', require('./services').stylesConfigService)
    .directive('customStyle', require('./directives').customStyle);
