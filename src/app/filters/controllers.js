'use strict';

function GlobalFiltersController($rootScope, $scope, $location, resultsService, filtersService) {

    function initFiltersView() {
        resultsService.getAllResults()
            .then(
                function (data) {
                    $scope.filters = filtersService.initGlobalFilters(data);
                    console.log($scope.filters);
                }
            );
    }

    $scope.propagateActiveFilters = function () {
        console.log('changed');
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

    $scope.activeFilters = {
        search: '',
        areas: '0',
        districts: '0',
        themes: []
    };

    initFiltersView();

}

module.exports = {
    GlobalFiltersController: GlobalFiltersController
};