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

    initFiltersView();

}

module.exports = {
    GlobalFiltersController: GlobalFiltersController
};