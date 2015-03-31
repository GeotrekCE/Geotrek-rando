'use strict';

function HomeController($scope, $rootScope, homeService, globalSettings) {

    $scope.toggleHome = function () {
        $rootScope.showHome = !$rootScope.showHome;
    };

    $scope.disableHomePage = function () {
        homeService.setChoice();
        $scope.toggleHome();
    };

    $scope.logo = globalSettings.LOGO_FILE;

}

module.exports = {
    HomeController: HomeController
};