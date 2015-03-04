'use strict';

function MapController($scope, globalSettings, $rootScope, $state, resultsService, mapService, $stateParams) {

    function updateMapWithResults(updateBounds) {
        resultsService.getFilteredResults()
            .then(
                function (data) {
                    $scope.results = data;
                    if (data.length > 0) {
                        mapService.displayResults(data, updateBounds);
                    } else {
                        mapService.clearAllLayers();
                    }
                }
            );

    }

    function updateMapWithDetails(forceRefresh) {

        var promise;
        if (!forceRefresh) {
            promise = resultsService.getAResultBySlug($stateParams.slug);
        } else {
            promise = resultsService.getAResultByID($scope.result.id, $scope.result.properties.category.id);
        }

        promise
            .then(
                function (data) {
                    $scope.result = data;
                    mapService.displayDetail($scope.result);
                }
            );
    }

    function mapInit(selector) {

        var mapSelector = selector || 'map';
        $scope.map = mapService.initMap(mapSelector);
        if ($state.current.name === 'layout.detail') {
            updateMapWithDetails();
        } else {
            updateMapWithResults();
        }

    }

    mapInit('map');

    $scope.map.on('zoomend', function () {
        if ($state.current.name === 'layout.root') {
            if ((mapService.treksIconified && $scope.map.getZoom() >= globalSettings.TREKS_TO_GEOJSON_ZOOM_LEVEL)
                    || (!mapService.treksIconified && $scope.map.getZoom() < globalSettings.TREKS_TO_GEOJSON_ZOOM_LEVEL)) {
                mapService.displayResults($scope.results, false);
            }
        }

    });

    $rootScope.$on('$stateChangeSuccess',
        function () {
            if ($state.current.name === 'layout.detail') {
                updateMapWithDetails();
            } else {
                updateMapWithResults();
            }
        });

    $scope.$on('updateFilters', function () {
        if ($state.current.name === 'layout.root') {
            updateMapWithResults(globalSettings.UPDATE_MAP_ON_FILTER);
        }
    });

    $rootScope.$on('switchGlobalLang', function () {
        if ($state.current.name === 'layout.detail') {
            updateMapWithDetails(true);
        } else {
            updateMapWithResults(true);
        }
    });
}

module.exports = {
    MapController : MapController
};