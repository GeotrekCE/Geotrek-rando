'use strict';

function headerController($scope, $rootScope, globalSettings) {
    $scope.mobileCollapsed = true;

    $scope.toggleMobileMenu = function toggleMobileMenu() {
        $scope.mobileCollapsed = !$scope.mobileCollapsed;
    };

    $scope.displayHomePage = function displayHomePage () {
        if (globalSettings.SHOW_HOME) {
            $rootScope.showHome = true;
        }
    };

    $rootScope.categoriesShown = true;

    $scope.collapseCategories = function collapseCategories() {
        $rootScope.categoriesShown = !$rootScope.categoriesShown;
        console.log($rootScope.categoriesShown)
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
