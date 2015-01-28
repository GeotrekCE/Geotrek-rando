'use strict';

function GlobalFiltersController($scope, resultsService, filtersService) {

    function initFiltersView() {
        resultsService.getAllResults()
            .then(
                function (data) {
                    $scope.filters = filtersService.initGlobalFilters(data);
                    console.log($scope.filters);
                }
            );
    }

    $scope.logActiveFilters = function () {
        console.log($scope.activeFilters);
    };

    $scope.activeFilters = {
        search: '',
        valley: '0',
        districts: '0',
        themes: []
    };
    initFiltersView();

}

module.exports = {
    GlobalFiltersController: GlobalFiltersController
};