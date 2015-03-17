'use strict';

function HomeController($scope, $location, categoriesService, filtersService, resultsService) {

    function initForm() {
        $scope.prefilter = {
            categories: "0",
            themes: "0"
        };
        resultsService.getAllResults()
            .then(
                function (data) {
                    $scope.filters = filtersService.initGlobalFilters(data);
                    console.log($scope.filters);
                }
            );
        categoriesService.getCategories()
            .then(
                function (data) {
                    $scope.categories = data;
                    console.log(data);
                }
            );
    }

    $scope.prefilterHome = function () {
        console.log($scope.prefilter);
        var query = {};

        if ($scope.prefilter.categories !== "0") {
            query.categories = $scope.prefilter.categories;
        }

        if ($scope.prefilter.themes !== "0") {
            query.themes = $scope.prefilter.themes;
        }

        $location.search(query);
    };

    initForm();
}

module.exports = {
    HomeController: HomeController
};