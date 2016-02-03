'use strict';

function headerController($scope, $rootScope, globalSettings) {
    if (globalSettings.HEADER_TEMPLATE_FILE) {
        $scope.headerTemplate = '/app/custom/templates/' + globalSettings.HEADER_TEMPLATE_FILE;
    } else {
        $scope.headerTemplate = '/app/header/templates/default-header.html';
    }

    $scope.displayHomePage = function displayHomePage () {
        if (globalSettings.SHOW_HOME) {
            $rootScope.showHome = true;
        }
    };

    $scope.switchMap = function switchMap () {
        $rootScope.mapIsShown = !$rootScope.mapIsShown;
        $rootScope.showWarningPanel = false;
    };

    $scope.logo = globalSettings.LOGO_FILE;
}

module.exports = {
    headerController: headerController
};
