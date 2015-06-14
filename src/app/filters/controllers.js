'use strict';

function GlobalFiltersController($rootScope, $scope, $location, globalSettings, resultsService, filtersService, utilsFactory, $timeout) {

    $scope.enabDistricts = globalSettings.ENABLE_DISTRICTS_FILTERING;
    $scope.enabCities = globalSettings.ENABLE_CITIES_FILTERING;
    $scope.enabStructures = globalSettings.ENABLE_STRUCTURE_FILTERING;
    $scope.filterLength = {};

    function updateFiltersTags() {
        $rootScope.activeFiltersTags = filtersService.getTagFilters($location.search());
    }

    function initFiltersView() {
        filtersService.initFilters()
            .then(
                function (filters) {
                    $scope.filters = filters;
                    $rootScope.activeFilters = filtersService.getActiveFilters();
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
        $rootScope.$broadcast('updateFilters');
    };

    // $scope.removeFilterByTag = function (tagLabel, tagValue) {
    //     var query = $location.search();
    //     if (typeof query[tagLabel] === 'string') {
    //         if (tagValue.toString() === query[tagLabel] || tagLabel === 'search') {
    //             delete query[tagLabel];
    //         }
    //     } else {
    //         _.forEach(query[tagLabel], function (filter, index) {
    //             if (tagValue.toString() === filter.toString()) {
    //                 query[tagLabel].splice(index, 1);
    //                 if (tagValue.toString().indexOf('-') > -1) {
    //                     $rootScope.$broadcast('resetRange', {category: tagLabel.split('_')[0], filter: tagLabel.split('_')[1]});
    //                 }
    //             }
    //         });
    //         if (query[tagLabel].length === 0) {
    //             delete query[tagLabel];
    //         }
    //     }

    //     if (tagLabel === 'categories') {
    //         _.forEach(query, function (filter, index) {
    //             if (index.split('_')[0] === tagValue.toString()) {
    //                 delete query[index];
    //             }
    //         });
    //         $rootScope.$broadcast('resetRange', {category: tagValue.toString(), filter: 'all'});
    //     }

    //     $location.search(query);
    //     $rootScope.$broadcast('updateFilters');
    // };

    $scope.resetFilters = function () {
        filtersService.resetActiveFilters();
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