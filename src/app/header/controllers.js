'use strict';

function headerController($scope, $rootScope, globalSettings) {
    $scope.mobileCollapsed = true;

    $scope.toggleMobileMenu = function toggleMobileMenu() {
        $scope.mobileCollapsed = !$scope.mobileCollapsed;
    };

    if (globalSettings.HEADER_TEMPLATE_FILE) {
        $scope.headerTemplate = '/app/custom/templates/' + globalSettings.HEADER_TEMPLATE_FILE;
    } else {
        $scope.headerTemplate = '/app/header/templates/default-header.html';
    }

    $scope.displayHomePage = function displayHomePage () {
        if (globalSettings.SHOW_HOME) {
            $rootScope.showHome = true;
        }
    };

    $scope.switchMap = function switchMap () {
        $rootScope.mapIsShown = !$rootScope.mapIsShown;
        $rootScope.showWarningPanel = false;
    };

    $scope.logo = globalSettings.LOGO_FILE;

    $scope.switchIcons = {
        map: '/images/icons/map.svg',
        textual: '/images/icons/android-list.svg'
    };

    var rootScopeEvents = [
        $rootScope.$on('$stateChangeSuccess', function (event, toState) {
            if (toState.name === 'layout.root') {
                $scope.switchIcons.textual = '/images/icons/android-list.svg';
            } else if (toState.name === 'layout.detail') {
                $scope.switchIcons.textual = '/images/icons/document-text.svg';
            }
        })
    ];

    $scope.$on('$destroy', function () { rootScopeEvents.forEach(function (dereg) { dereg(); }); });
}

module.exports = {
    headerController: headerController
};
