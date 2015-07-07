'use strict';

function warningPanelDirective() {
    return {
        restrict: 'E',
        replace: true,
        scope: true,
        template: require('./templates/warning-panel.html'),
        controller: 'WarningPanelController'
    };
}

module.exports = {
    warningPanelDirective: warningPanelDirective
};
