'use strict';

var controllers = require('./controllers');

function warningPanelDirective() {
    return {
        restrict: 'E',
        replace: true,
        scope: true,
        template: require('./templates/warning-panel.html'),
        controller: controllers.WarningPanelController
    };
}

module.exports = {
    warningPanelDirective: warningPanelDirective
};