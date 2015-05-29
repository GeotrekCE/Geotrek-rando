'use strict';

function HomeController($scope, $rootScope, translationService, homeService, globalSettings) {

    $scope.initHome = function () {
        var currentLang = translationService.getCurrentLang();

        if (globalSettings.HOME_TEMPLATE_FILE[currentLang.code]) {
            $scope.homeTemplate = 'app/custom/templates/' + globalSettings.HOME_TEMPLATE_FILE[currentLang.code];
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

    $scope.logo = globalSettings.LOGO_FILE;

    $scope.initHome();

    $rootScope.$on('$stateChangeStart', function (event, toState) {
        console.log(toState);
        if (toState.name !== 'layout.root' && $rootScope.showHome) {
            $scope.toggleHome();
        }
    });

}

module.exports = {
    HomeController: HomeController
};