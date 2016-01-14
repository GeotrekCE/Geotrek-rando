'use strict';

function HomeController($scope, $rootScope, $state, translationService, categoriesService, $location, homeService, globalSettings, filtersService) {

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
        $state.go('layout.root');
        if (typeof currentCategory !== 'object') {
            currentCategory = [currentCategory];
        }
        $rootScope.activeFilters.categories = currentCategory;
        filtersService.updateActiveFilters($rootScope.activeFilters);
        $rootScope.$broadcast('updateFilters', true);

        updateFiltersTags();
        $scope.toggleHome();
    };

    // Get icons for suggested contents
    categoriesService.getNonExcludedCategories().then(
        function (categories) {
            for (var i = 0; i < categories.length; i++) {
                if (categories[i].id === 'C8') {
                    $scope.cat_C8 = categories[i].pictogram;
                }
                if (categories[i].id === 'C3') {
                    $scope.cat_C3 = categories[i].pictogram;
                }
                if (categories[i].id === 'T4') {
                    $scope.cat_T4 = categories[i].pictogram;
                }
                if (categories[i].id === 'C1') {
                    $scope.cat_C1 = categories[i].pictogram;
                }
            }
        }
    );

    $scope.logo = globalSettings.LOGO_FILE;

    $scope.initHome();

    var rootScopeEvents = [
        $rootScope.$on('$stateChangeStart', function (event, toState) {
            if (toState.name !== 'layout.root' && $rootScope.showHome) {
                $scope.toggleHome();
            }
        })
    ];

    rootScopeEvents.push(
        $rootScope.$on('startSwitchGlobalLang', function () {
            $scope.initHome();
        })
    );

    $scope.$on('$destroy', function () { rootScopeEvents.forEach(function (dereg) { dereg(); }); });

}

function RandomContentsListWidgetController($scope, resultsService, utilsFactory) {
    function getRandomContents() {
        resultsService.getRandomContentsByCategory($scope.categories, $scope.quantity)
            .then(
                function (randomContents) {
                    $scope.randomContents = randomContents;
                },
                function (err) {
                    console.error(err);
                }
            );
    }

    function init() {
        getRandomContents();
    }

    $scope.isSVG = utilsFactory.isSVG;
    init();
}

function RandomContentWidgetController($scope, resultsService, utilsFactory) {
    function getRandomContent() {
        resultsService.getRandomContentsByCategory($scope.category, 1)
            .then(
                function (randomContent) {
                    console.log(randomContent);
                    $scope.randomContent = randomContent[0];
                },
                function (err) {
                    console.error(err);
                }
            );
    }

    function init() {
        getRandomContent();
    }

    $scope.isSVG = utilsFactory.isSVG;
    init();
}

module.exports = {
    HomeController: HomeController,
    RandomContentsListWidgetController: RandomContentsListWidgetController,
    RandomContentWidgetController: RandomContentWidgetController
};
