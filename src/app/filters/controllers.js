'use strict';

function GlobalFiltersController($rootScope, $scope, $location, resultsService, filtersService, utilsFactory) {

    $scope.filterLength = {};

    function updateFiltersTags() {
        $scope.activeFiltersTags = filtersService.getSelectedFilters($location.search());
    }

    function countActiveValues(filterName) {
        $scope.filterLength[filterName] = 0;
        _.forEach($scope.activeFilters[filterName], function (value) {
            if (value) {
                $scope.filterLength[filterName]++;
            }
        });
    }

    function updateFilters() {
        $scope.activeFilters = {
            search: $location.search().search || '',
            areas:  [],
            districts: [],
            themes: []
        };

        $scope.filterLength = {
            districts: 0,
            areas: 0,
            themes: 0
        };

        countActiveValues('themes');
        _.forEach($location.search().themes, function (themeId) {
            $scope.activeFilters.themes[themeId] = true;
        });

        countActiveValues('areas');
        _.forEach($location.search().areas, function (areaId) {
            $scope.activeFilters.areas[areaId] = true;
        });

        countActiveValues('districts');
        _.forEach($location.search().districts, function (districtId) {
            $scope.activeFilters.districts[districtId] = true;
        });
    }

    function initFiltersView() {
        resultsService.getAllResults()
            .then(
                function (data) {
                    $scope.filters = filtersService.initGlobalFilters(data);
                    updateFilters();
                    updateFiltersTags();
                    $rootScope.$on('updateFilters', updateFilters);
                    $rootScope.$on('updateFilters', updateFiltersTags);
                }
            );
    }

    $scope.propagateActiveFilters = function () {
        var query = $location.search();

        _.forEach($scope.activeFilters, function (filter, key) {
            if (query[key]) {
                delete query[key];
            }
            if (key === 'themes' || key === 'districts' || key === 'areas') {
                countActiveValues(key);
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

        $location.search(query);
        $rootScope.$broadcast('updateFilters');
    };

    $scope.removeFilterByTag = function (tagLabel, tagValue) {
        var query = $location.search();
        if (typeof query[tagLabel] === 'string') {
            if (parseInt(tagValue, 10) === parseInt(query[tagLabel], 10)) {
                delete query[tagLabel];
            }
        } else {
            _.forEach(query[tagLabel], function (filter, index) {
                if (parseInt(tagValue, 10) === parseInt(filter, 10)) {
                    query[tagLabel].splice(index, 1);
                }
            });
            if (query[tagLabel].length === 0) {
                delete query[tagLabel];
            }
        }

        if (tagLabel === 'categories') {
            _.forEach(query, function (filter, index) {
                console.log(parseInt(index.split('_')[0], 10));
                console.log(parseInt(tagValue, 10));
                if (parseInt(index.split('_')[0], 10) === parseInt(tagValue, 10)) {
                    delete query[index];
                }
            });
        }

        $location.search(query);
        $rootScope.$broadcast('updateFilters');
    };

    $scope.isSVG = utilsFactory.isSVG;

    initFiltersView();

}

module.exports = {
    GlobalFiltersController: GlobalFiltersController
};