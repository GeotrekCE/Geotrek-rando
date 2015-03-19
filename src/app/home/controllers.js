'use strict';

function HomeController($scope, $rootScope, homeService) {

    $scope.toggleHome = function () {
        $rootScope.showHome = !$rootScope.showHome;
    };

    $scope.disableHomePage = function () {
        homeService.setChoice();
        $scope.toggleHome();
    };

}

module.exports = {
    HomeController: HomeController
};