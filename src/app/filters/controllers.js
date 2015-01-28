'use strict';

function GlobalFiltersController($rootScope, $scope, $location, resultsService, filtersService) {

    function initFiltersView() {
        resultsService.getAllResults()
            .then(
                function (data) {
                    $scope.filters = filtersService.initGlobalFilters(data);

                    $scope.activeFilters = {
                        search: $location.search().search || '',
                        areas: $location.search().areas || '0',
                        districts: $location.search().districts || '0',
                        themes: $location.search().themes || []
                    };

                }
            );
    }

    $scope.propagateActiveFilters = function () {
        var query = {};

        _.forEach($scope.activeFilters, function (filter, key) {
            if (key === 'themes') {
                if (filter.length > 0) {
                    var tempArray = [],
                        themesNotAllFalse = false;
                    _.forEach(filter, function (element, elementKey) {
                        if (element && element !== '0') {
                            tempArray.push(elementKey);
                            themesNotAllFalse = true;
                        }
                    });
                    if (themesNotAllFalse) {
                        query[key] = tempArray;
                    }
                }
            } else {
                if (filter && filter !== '0') {
                    query[key] = filter;
                }
            }

        });
        $location.search(query);
        $rootScope.$broadcast('updateFilters');
    };

    initFiltersView();

}

module.exports = {
    GlobalFiltersController: GlobalFiltersController
};