'use strict';

function GlobalFiltersController($rootScope, $scope, $location, globalSettings, resultsService, filtersService, utilsFactory, $timeout) {

    $scope.enabDistricts = globalSettings.ENABLE_DISTRICTS_FILTERING;
    $scope.enabCities = globalSettings.ENABLE_CITIES_FILTERING;
    $scope.enabStructures = globalSettings.ENABLE_STRUCTURE_FILTERING;
    $scope.filterLength = {};

    function updateFiltersTags() {
        $rootScope.activeFiltersTags = filtersService.getTagFilters();
    }

    function initFiltersView() {
        filtersService.initFilters()
            .then(
                function (filters) {
                    $scope.filters = filters;
                    $rootScope.activeFilters = filtersService.getActiveFilters();
                    if (globalSettings.SHOW_FILTERS_ON_MAP) {
                        updateFiltersTags();
                    }
                    $rootScope.$broadcast('updateFilters');
                }
            );
    }

    $scope.toogleFilter = function (filterType, filterId) {
        var filters = $rootScope.activeFilters[filterType];

        if (filters) {
            var indexOfFilter = filters.indexOf(filterId.toString());
            if (indexOfFilter > -1) {
                filters.splice(indexOfFilter, 1);
            } else {
                $rootScope.activeFilters[filterType].push(filterId.toString());    
            }
        } else {
            $rootScope.activeFilters[filterType] = [filterId.toString()];
        }
        $scope.propagateActiveFilters();
    };

    $scope.changeSearchFilter = function () {
        if ($scope.searchFieldUpdate) {
            $timeout.cancel($scope.searchFieldUpdate);
        }
        $scope.searchFieldUpdate = $timeout(function () {
            $scope.propagateActiveFilters();  
        }, 500);
    };

    $scope.propagateActiveFilters = function () {
        filtersService.updateActiveFilters($rootScope.activeFilters);
        if (globalSettings.SHOW_FILTERS_ON_MAP) {
            updateFiltersTags();
        }
        $rootScope.$broadcast('updateFilters');
    };

    $scope.removeFilterByTag = function (tagLabel, tagValue) {
        var activeFilters = $rootScope.activeFilters;

        if (typeof activeFilters[tagLabel] === 'string') {
            if (tagValue.toString() === activeFilters[tagLabel] || tagLabel === 'search') {
                delete activeFilters[tagLabel];
            }
        } else {
            _.forEach(activeFilters[tagLabel], function (filter, index) {
                if (filter && tagValue.toString() === filter.toString()) {
                    activeFilters[tagLabel].splice(index, 1);
                    if (tagValue.toString().indexOf('-') > -1) {
                        $rootScope.$broadcast('resetRange', {filter: tagLabel});
                    }
                }
            });
            if (activeFilters[tagLabel].length === 0) {
                delete activeFilters[tagLabel];
            }
        }

        $rootScope.activeFilters = activeFilters;
        $scope.propagateActiveFilters();
    };

    $scope.resetFilters = function () {
        filtersService.resetActiveFilters();
        $rootScope.activeFilters = filtersService.getActiveFilters();
        $rootScope.$broadcast('resetRange', {filter: 'all'});
        $scope.propagateActiveFilters();
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