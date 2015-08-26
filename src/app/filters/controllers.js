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
                    console.log($rootScope.activeFilters);
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
            if (filterId === 'all') {
                $rootScope.activeFilters[filterType] = [];
            } else {
                var indexOfFilter = filters.indexOf(filterId.toString());
                if (indexOfFilter > -1) {
                    filters.splice(indexOfFilter, 1);
                } else {
                    $rootScope.activeFilters[filterType].push(filterId.toString());
                }
            }
        } else if (filterId !== 'all') {
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
        console.log($rootScope.activeFilters);
        filtersService.updateActiveFilters($rootScope.activeFilters);
        if (globalSettings.SHOW_FILTERS_ON_MAP) {
            updateFiltersTags();
        }
        $rootScope.$broadcast('updateFilters');
    };

    $scope.isSVG = utilsFactory.isSVG;

    initFiltersView();

    var rootScopeEvents = [
        $rootScope.$on('switchGlobalLang', function () {
            initFiltersView();
        })
    ];

    $scope.$on('$destroy', function () { rootScopeEvents.forEach(function (dereg) { dereg(); }); });

}

function FiltersTagsController($rootScope, $scope, globalSettings, filtersService) {

    function updateFiltersTags() {
        $rootScope.activeFiltersTags = filtersService.getTagFilters();
    }

    $scope.propagateActiveFilters = function () {
        filtersService.updateActiveFilters($rootScope.activeFilters);
        if (globalSettings.SHOW_FILTERS_ON_MAP) {
            updateFiltersTags();
        }
        $rootScope.$broadcast('updateFilters');
    };

    $scope.resetFilters = function () {
        filtersService.resetActiveFilters();
        $rootScope.activeFilters = filtersService.getActiveFilters();
        $rootScope.$broadcast('resetRange', {filter: 'all'});
        $scope.propagateActiveFilters();
    };

    $scope.removeFilterByTag = function (tagLabel, tagValue) {
        var activeFilters = $rootScope.activeFilters;

        if (typeof activeFilters[tagLabel] === 'string') {
            if (tagValue.toString() === activeFilters[tagLabel] || tagLabel === 'search') {
                activeFilters[tagLabel] = [];
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
                activeFilters[tagLabel] = [];
            }
        }

        $rootScope.activeFilters = activeFilters;
        $scope.propagateActiveFilters();
    };
}

module.exports = {
    GlobalFiltersController: GlobalFiltersController,
    FiltersTagsController: FiltersTagsController
};
