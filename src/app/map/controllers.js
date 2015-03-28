'use strict';

function MapController($scope, globalSettings, $translate, $rootScope, $state, resultsService, mapService, $stateParams) {

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

    function initCtrlsTranslation() {
        var controllersListe = [
            {
                selector: '.leaflet-control-zoom-in',
                isTitle: true,
                translationID: 'ZOOM_IN'
            },
            {
                selector: '.leaflet-control-zoom-out',
                isTitle: true,
                translationID: 'ZOOM_OUT'
            },
            {
                selector: '.leaflet-control-zoom-fullscreen',
                isTitle: true,
                translationID: 'FULL_SCREEN'
            },
            {
                selector: '.leaflet-control-resetview-button',
                isTitle: true,
                translationID: 'RECENTER_VIEW'
            },
            {
                selector: '.simple-layer-switcher .toggle-layer',
                isTitle: true,
                translationID: 'TILES_SWITCH'
            },
            {
                selector: '.leaflet-control-viewportfilter-caption',
                isTitle: false,
                translationID: 'VIEWPORT_FILTERING'
            }
        ];

        _.forEach(controllersListe, function (currentController) {
            var domElement = document.querySelector(currentController.selector);
            $translate(currentController.translationID)
                .then(
                    function (translation) {
                        if (currentController.isTitle) {
                            domElement.setAttribute('title', translation);
                        } else {
                            domElement.innerHTML = translation;
                        }
                    }
                );
        });
    }

    function mapInit(selector) {

        var mapSelector = selector || 'map';
        $rootScope.map = mapService.initMap(mapSelector);
        initCtrlsTranslation();
        if ($state.current.name === 'layout.detail') {
            updateMapWithDetails();
        } else {
            updateMapWithResults();
        }

    }

    mapInit('map');

    $rootScope.map.on('zoomend', function () {
        if ($state.current.name === 'layout.root') {
            if ((mapService.treksIconified && $rootScope.map.getZoom() >= globalSettings.TREKS_TO_GEOJSON_ZOOM_LEVEL)
                    || (!mapService.treksIconified && $rootScope.map.getZoom() < globalSettings.TREKS_TO_GEOJSON_ZOOM_LEVEL)) {
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
        initCtrlsTranslation();
    });
}

module.exports = {
    MapController : MapController
};