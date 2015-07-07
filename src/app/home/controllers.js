'use strict';

function HomeController($scope, $rootScope, translationService, $location, homeService, globalSettings, filtersService) {

    function updateFiltersTags() {
        $rootScope.activeFiltersTags = filtersService.getTagFilters();
    }

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

    $scope.accessSpecificCategory = function (currentCategory) {
        if (typeof currentCategory !== 'object') {
            currentCategory = [currentCategory];
        }
        $rootScope.activeFilters.categories = currentCategory;
        filtersService.updateActiveFilters($rootScope.activeFilters);
        $rootScope.$broadcast('updateFilters');
        updateFiltersTags();
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
