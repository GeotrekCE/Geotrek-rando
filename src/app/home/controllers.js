'use strict';

function HomeController($scope, $rootScope, $location, categoriesService, filtersService, resultsService) {

    $scope.accessSite = function () {
        $rootScope.showHome = false;
    };

    $scope.disableHomePage = function () {
        $scope.accessSite();
    };

}

module.exports = {
    HomeController: HomeController
};