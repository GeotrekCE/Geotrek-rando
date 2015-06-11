'use strict';

function GlobalFiltersController($rootScope, $scope, $location, globalSettings, resultsService, filtersService, utilsFactory) {

    $scope.enabDistricts = globalSettings.ENABLE_DISTRICTS_FILTERING;
    $scope.enabCities = globalSettings.ENABLE_CITIES_FILTERING;
    $scope.enabStructures = globalSettings.ENABLE_STRUCTURE_FILTERING;
    $scope.filterLength = {};

    function updateFiltersTags() {
        $scope.activeFiltersTags = filtersService.getTagFilters($location.search());
    }

    function countActiveValues(filterName) {
        var filterLength = {
            districts: 0,
            cities: 0,
            structure: 0,
            themes: 0
        };

        _.forEach(filterLength, function (numberOfValue, valueName) {
            for (var i = $scope.activeFilters[valueName].length - 1; i >= 0; i--) {
                if ($scope.activeFilters[valueName][i]) {
                    filterLength[valueName]++;
                }
            }
        });

        $scope.filterLength = filterLength;
        
    }

    function getFilterFromUrl(filterName) {
        var urlFilters = $location.search()[filterName],
            activeFiltersArray = [];

        if (typeof urlFilters === 'string') {
            urlFilters = [urlFilters];
        }
        _.forEach(urlFilters, function (filterId) {
            activeFiltersArray[filterId] = true;
        });

        return activeFiltersArray;
    }

    function updateFilters() {
        var activeFilters = {
            search: $location.search().search || '',
            cities:  getFilterFromUrl('cities'),
            districts: getFilterFromUrl('districts'),
            structure: getFilterFromUrl('structure'),
            themes: getFilterFromUrl('themes')
        };

        $scope.activeFilters = activeFilters;

        countActiveValues();
        if (globalSettings.SHOW_FILTERS_ON_MAP) {
            updateFiltersTags();
        }
    }

    function initFiltersView() {
        resultsService.getAllResults()
            .then(
                function (data) {
                    $scope.filters = filtersService.initGlobalFilters(data);
                    updateFilters();
                    $rootScope.$on('updateFilters', updateFilters);
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

        filtersService.updateActiveFilters(query);
        $rootScope.$broadcast('updateFilters');
    };

    $scope.removeFilterByTag = function (tagLabel, tagValue) {
        var query = $location.search();
        if (typeof query[tagLabel] === 'string') {
            if (tagValue.toString() === query[tagLabel] || tagLabel === 'search') {
                delete query[tagLabel];
            }
        } else {
            _.forEach(query[tagLabel], function (filter, index) {
                if (tagValue.toString() === filter.toString()) {
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
                if (index.split('_')[0] === tagValue.toString()) {
                    delete query[index];
                }
            });
            $rootScope.$broadcast('resetRange', {category: tagValue.toString(), filter: 'all'});
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