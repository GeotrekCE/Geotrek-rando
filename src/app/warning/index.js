'use strict'

angular.module('rando.warning', [])
    .controller('WarningPanelController', require('./controllers').WarningPanelController)
    .directive('warningPanel', require('./directives').warningPanelDirective);
