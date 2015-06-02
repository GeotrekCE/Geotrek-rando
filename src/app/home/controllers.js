'use strict';

function HomeController($scope, $rootScope, translationService, $location, homeService, globalSettings) {

    $scope.initHome = function () {
        var currentLang = translationService.getCurrentLang();
        if (currentLang.code) {
            currentLang = currentLang.code;
        }
        if (globalSettings.HOME_TEMPLATE_FILE[currentLang]) {
            $scope.homeTemplate = 'app/custom/templates/' + globalSettings.HOME_TEMPLATE_FILE[currentLang];
        } else {
            $scope.homeTemplate = 'app/home/templates/home-default.html';
        }
    };

    $scope.toggleHome = function () {
        $rootScope.showHome = !$rootScope.showHome;
    };

    $scope.disableHomePage = function () {
        homeService.setChoice();
        $scope.toggleHome();
    };

    $scope.accessSpecificCategory = function (currentQuery) {
        $location.search(currentQuery);
        $rootScope.$broadcast('updateCategories');
        $rootScope.$broadcast('updateFilters');
        $scope.toggleHome();
    };

    $scope.logo = globalSettings.LOGO_FILE;

    $scope.initHome();

    $rootScope.$on('$stateChangeStart', function (event, toState) {
        if (toState.name !== 'layout.root' && $rootScope.showHome) {
            $scope.toggleHome();
        }
    });

}

module.exports = {
    HomeController: HomeController
};