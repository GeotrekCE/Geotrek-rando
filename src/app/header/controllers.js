'use strict'

function headerController($scope, $rootScope, globalSettings) {
    if (globalSettings.HEADER_TEMPLATE_FILE) {
        $scope.headerTemplate = '/app/custom/templates/' + globalSettings.HEADER_TEMPLATE_FILE;
    } else {
        $scope.headerTemplate = '/app/header/templates/default-header.html';
    }

    $scope.displayHomePage = function () {
        if (globalSettings.SHOW_HOME) {
            $rootScope.showHome = true;
        }
    };

    $scope.switchMap = function () {
        $rootScope.mapIsShown = !$rootScope.mapIsShown;
    }

    $scope.logo = globalSettings.LOGO_FILE;
}

module.exports = {
    headerController: headerController
};
