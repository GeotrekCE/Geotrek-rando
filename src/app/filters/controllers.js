'use strict';

function GlobalFiltersController($rootScope, $scope, $location, resultsService, filtersService) {

    function initFiltersView() {
        resultsService.getAllResults()
            .then(
                function (data) {
                    $scope.filters = filtersService.initGlobalFilters(data);

                    $scope.activeFilters = {
                        search: $location.search().search || '',
                        areas:  [],
                        districts: [],
                        themes: []
                    };

                    _.forEach($location.search().themes, function (themeId) {
                        $scope.activeFilters.themes[themeId] = true;
                    });

                    _.forEach($location.search().areas, function (areaId) {
                        $scope.activeFilters.areas[areaId] = true;
                    });

                }
            );
    }

    $scope.propagateActiveFilters = function () {
        var query = {};
        _.forEach($scope.activeFilters, function (filter, key) {

            if (key === 'themes' || key === 'districts' || key === 'areas') {
                if (filter.length > 0) {
                    var tempArray = [],
                        NotAllFalse = false;
                    _.forEach(filter, function (element, elementKey) {
                        if (element && element !== '0') {
                            tempArray.push(elementKey);
                            NotAllFalse = true;
                        }
                    });
                    if (NotAllFalse) {
                        query[key] = tempArray;
                    }
                }
            } else {
                if (filter && filter !== '0') {
                    query[key] = filter;
                }
            }

        });

        if ($location.search().categories) {
            query.categories = $location.search().categories;
        }

        $location.search(query);
        $rootScope.$broadcast('updateFilters');
    };

    initFiltersView();

}

module.exports = {
    GlobalFiltersController: GlobalFiltersController
};