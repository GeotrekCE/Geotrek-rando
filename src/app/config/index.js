'use strict';

var _ = require('lodash');

angular.module('rando.config', [])
    .constant('globalSettings', _.assign(require('./settings.default.json'), require('../../../custom/settings.custom.json')))
    .config(require('./providers.config').providersConfig)
    .factory('settingsFactory', require('./factories').settingsFactory)
    .service('stylesConfigService', require('./services').stylesConfigService)
    .directive('customStyle', require('./directives').customStyle);
