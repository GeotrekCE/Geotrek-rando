'use strict';

function GlobalFiltersController($rootScope, $scope, $location, globalSettings, resultsService, filtersService, utilsFactory) {

    $scope.enabDistricts = globalSettings.ENABLE_DISTRICTS_FILTERING;
    $scope.enabCities = globalSettings.ENABLE_CITIES_FILTERING;
    $scope.enabStructures = globalSettings.ENABLE_STRUCTURE_FILTERING;
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
        var themesArray = [], citiesArray = [], districtsArray = [], structureArray = [];
        $scope.activeFilters = {
            search: $location.search().search || '',
            cities:  [],
            districts: [],
            structure: [],
            themes: []
        };

        $scope.filterLength = {
            districts: 0,
            cities: 0,
            structure: 0,
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

        structureArray = $location.search().structure;
        if (typeof structureArray === 'string') {
            structureArray = [structureArray];
        }
        _.forEach(structureArray, function (structureId) {
            $scope.activeFilters.structure[structureId] = true;
        });
        countActiveValues('structure');
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
            if (key === 'themes' || key === 'districts' || key === 'cities' || key === 'structure') {
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
            if (tagValue === query[tagLabel] || tagLabel === 'search') {
                delete query[tagLabel];
            }
        } else {
            _.forEach(query[tagLabel], function (filter, index) {
                if (tagValue === filter) {
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
                if (index.split('_')[0] === tagValue) {
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