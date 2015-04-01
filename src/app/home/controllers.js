'use strict';

function HomeController($scope, $rootScope, translationService, homeService, globalSettings) {

    $scope.initHome = function () {
        var currentLang = translationService.getCurrentLang();
        $scope.homeTemplate = 'app/home/templates/';
        if (globalSettings.HOME_TEMPLATE_FILE[currentLang.code]) {
            $scope.homeTemplate += 'custom/' + globalSettings.HOME_TEMPLATE_FILE[currentLang.code];
        } else {
            $scope.homeTemplate += 'home-default.html';
        }
    };

    $scope.toggleHome = function () {
        $rootScope.showHome = !$rootScope.showHome;
    };

    $scope.disableHomePage = function () {
        homeService.setChoice();
        $scope.toggleHome();
    };

    $scope.logo = globalSettings.LOGO_FILE;

    $scope.initHome();

}

module.exports = {
    HomeController: HomeController
};