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
        var themesArray = [], citiesArray = [], districtsArray = [];
        $scope.activeFilters = {
            search: $location.search().search || '',
            cities:  [],
            districts: [],
            themes: []
        };

        $scope.filterLength = {
            districts: 0,
            cities: 0,
            themes: 0
        };

        themesArray = $location.search().themes;
        if (typeof themesArray === 'string') {
            themesArray = [themesArray];
        }
        _.forEach(themesArray, function (themeId) {
            $scope.activeFilters.themes[themeId] = true;
        });
        countActiveValues('themes');

        citiesArray = $location.search().cities;
        if (typeof citiesArray === 'string') {
            citiesArray = [citiesArray];
        }
        _.forEach(citiesArray, function (citiyId) {
            $scope.activeFilters.cities[citiyId] = true;
        });
        countActiveValues('cities');

        districtsArray = $location.search().districts;
        if (typeof districtsArray === 'string') {
            districtsArray = [districtsArray];
        }
        _.forEach(districtsArray, function (districtId) {
            $scope.activeFilters.districts[districtId] = true;
        });
        countActiveValues('districts');
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
            if (key === 'themes' || key === 'districts' || key === 'cities') {
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
            if (parseInt(tagValue, 10) === parseInt(query[tagLabel], 10) || tagLabel === 'search') {
                delete query[tagLabel];
            }
        } else {
            _.forEach(query[tagLabel], function (filter, index) {
                if (parseInt(tagValue, 10) === parseInt(filter, 10)) {
                    query[tagLabel].splice(index, 1);
                    if (tagValue.toString().indexOf('-') > -1) {
                        $rootScope.$broadcast('resetRange', {category: tagLabel.split('_')[0], filter: tagLabel.split('_')[1]});
                    }
                }
            });
            if (query[tagLabel].length === 0) {
                delete query[tagLabel];
            }
        }

        if (tagLabel === 'categories') {
            _.forEach(query, function (filter, index) {
                if (parseInt(index.split('_')[0], 10) === parseInt(tagValue, 10)) {
                    delete query[index];
                }
            });
            $rootScope.$broadcast('resetRange', {category: tagValue, filter: 'all'});
        }

        $location.search(query);
        $rootScope.$broadcast('updateFilters');
    };

    $scope.resetFilters = function () {
        var query = $location.search();
        $location.search({});
        $rootScope.$broadcast('updateFilters');
    };

    $scope.isSVG = utilsFactory.isSVG;

    initFiltersView();
    $rootScope.$on('switchGlobalLang', function () {
        initFiltersView();
    });

}

module.exports = {
    GlobalFiltersController: GlobalFiltersController
};