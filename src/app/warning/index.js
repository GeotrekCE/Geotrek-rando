'use strict';

angular.module('rando.warning', [])
    .controller('WarningPanelController', require('./controllers').WarningPanelController)
    .directive('fileread', require('./directives').fileReadDirective)
    .directive('warningPanel', require('./directives').warningPanelDirective)
    .service('WarningService', require('./services').WarningService)
    .service('WarningMapService', require('./services').WarningMapService);