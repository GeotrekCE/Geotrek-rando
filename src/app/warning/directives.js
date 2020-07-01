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

function fileReadDirective() {
    return {
        scope: {
            fileread: "="
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                scope.$apply(function () {
                    scope.fileread = changeEvent.target.files[0];
                });
            });
        }
    }
}

module.exports = {
    warningPanelDirective: warningPanelDirective,
    fileReadDirective: fileReadDirective
};
