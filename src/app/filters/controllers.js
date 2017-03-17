'use strict';

function GlobalFiltersController($rootScope, $scope, $location, globalSettings, resultsService, filtersService, utilsFactory, $timeout) {

    $scope.enabDistricts  = globalSettings.ENABLE_DISTRICTS_FILTERING;
    $scope.enabCities     = globalSettings.ENABLE_CITIES_FILTERING;
    $scope.enabStructures = globalSettings.ENABLE_STRUCTURE_FILTERING;
    $scope.filterLength   = {};
    $scope.extend         = false;
    $scope.filterLength = {};
    $scope.selectMenus = {
        cities: {
            opened: false
        },
        districts: {
            opened: false
        },
        structure: {
            opened: false
        }

    };

    function openSelectMenu(selectName) {
        $scope.selectMenus[selectName].opened = true;
    }

    function closeSelectMenu(selectName) {
        $scope.selectMenus[selectName].opened = false;
    }

    function updateFiltersTags() {
        $rootScope.activeFiltersTags = filtersService.getTagFilters();
    }

    function customSort (array) {
        if (!(array instanceof Array)) throw "TypeError: parameter 1 is not of type 'Array'";

        var input  = [[], array];
        var output = [];
        var length = input[1].length;

        input[0]   = input[1].splice(0, Math.ceil(length/2));

        for (var i = 0 ; i < length ; i++) {
            output.push(input[i%2].shift());
        }

        return output;
    }

    function initFiltersView() {
        filtersService.initFilters()
            .then(
                function (filters) {
                    filters.themes = _.sortBy(filters.themes, 'label');

                    filters.themes.forEach(function (theme, index) {
                        theme.baseOrder = index;
                    });

                    filters.themes = customSort(filters.themes);

                    $scope.filters = filters;
                    $rootScope.activeFilters = filtersService.getActiveFilters();
                    if (globalSettings.SHOW_FILTERS_ON_MAP) {
                        updateFiltersTags();
                    }
                    $rootScope.$broadcast('updateFilters');
                }
            );
    }

    $scope.toogleFilter = function toogleFilter (filterType, filterId) {
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
        if (globalSettings.GEO_FILTERS_AUTO_CLOSE && $scope.selectMenus[filterType]) {
            closeSelectMenu(filterType);
        }
        if (globalSettings.UPDATE_MAP_ON_FILTER) {
            $scope.propagateActiveFilters();
        }
    };

    $scope.changeSearchFilter = function changeSearchFilter () {
        if ($scope.searchFieldUpdate) {
            $timeout.cancel($scope.searchFieldUpdate);
        }
        $scope.searchFieldUpdate = $timeout(function () {
            $scope.propagateActiveFilters();
        }, 500);
    };

    $scope.propagateActiveFilters = function propagateActiveFilters () {
        filtersService.updateActiveFilters($rootScope.activeFilters);
        if (globalSettings.SHOW_FILTERS_ON_MAP) {
            updateFiltersTags();
        }
        $rootScope.$broadcast('updateFilters');
    };

    $scope.toggleExtend = function toggleExtend () {
        $scope.extend = !$scope.extend;
    }

    initFiltersView();

    var rootScopeEvents = [
        $rootScope.$on('switchGlobalLang', function () {
            initFiltersView();
        })
    ];

    $scope.$on('$destroy', function () { rootScopeEvents.forEach(function (dereg) { dereg(); }); });
    $scope.openSelectMenu  = openSelectMenu;
    $scope.closeSelectMenu = closeSelectMenu;

}

function FiltersTagsController($rootScope, $scope, globalSettings, filtersService) {

    function updateFiltersTags() {
        $rootScope.activeFiltersTags = filtersService.getTagFilters();
    }

    $scope.propagateActiveFilters = function propagateActiveFilters () {
        filtersService.updateActiveFilters($rootScope.activeFilters);
        if (globalSettings.SHOW_FILTERS_ON_MAP) {
            updateFiltersTags();
        }
        $rootScope.$broadcast('updateFilters');
    };

    $scope.resetFilters = function resetFilters () {
        filtersService.resetActiveFilters();
        $rootScope.activeFilters = filtersService.getActiveFilters();
        $rootScope.$broadcast('resetRange', {filter: 'all'});
        $scope.propagateActiveFilters();
    };

    $scope.removeFilterByTag = function removeFilterByTag (tagLabel, tagValue) {
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

    $scope.toggleExtend = function toggleExtend () {
        $scope.extend = !$scope.extend;
    }
}

module.exports = {
    GlobalFiltersController: GlobalFiltersController,
    FiltersTagsController: FiltersTagsController
};
