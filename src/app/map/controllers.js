'use strict';

function MapController($q, $scope, globalSettings, $translate, $rootScope, $state, resultsService, filtersService, mapService, $stateParams) {

    function updateMapWithResults(fitBounds) {
        var deferred = $q.defer();

        if ($scope.shouldFitBounds) {
            fitBounds = true;
        }
        $scope.shouldFitBounds = false;

        $rootScope.elementsLoading ++;
        deferred.resolve(
            filtersService.getFilteredResults()
                .then(
                    function (data) {
                        $scope.results = data;
                        if (data.length > 0) {
                            mapService.displayResults(data, fitBounds);
                            $rootScope.elementsLoading --;
                        } else {
                            mapService.clearAllLayers();
                            $rootScope.elementsLoading --;
                        }
                    }
                )
        );
        return deferred.promise;
    }

    function updateMapWithDetails(forceRefresh) {
        var deferred = $q.defer();

        $rootScope.elementsLoading ++;
        var promise;
        if (!forceRefresh) {
            promise = resultsService.getAResultBySlug($stateParams.slug, $stateParams.catSlug);
        } else {
            promise = resultsService.getAResultByID($scope.result.id, $scope.result.properties.category.id);
        }

        deferred.resolve(
            promise
                .then(
                    function (data) {
                        $scope.result = data;
                        mapService.displayDetail($scope.result);
                        $rootScope.elementsLoading --;
                    }, function () {
                        $rootScope.elementsLoading --;
                    }
                )
        );

        return deferred.promise;
    }

    function initCtrlsTranslation() {
        var deferred = $q.defer();

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

        var promises = [];

        _.forEach(controllersListe, function (currentController) {
            var domElement = document.querySelector(currentController.selector);
            promises.push(
                $translate(currentController.translationID)
                    .then(
                        function (translation) {
                            if (currentController.isTitle) {
                                domElement.setAttribute('title', translation);
                            } else {
                                domElement.innerHTML = translation;
                            }
                        }
                    )
            );
        });

        $q.all(promises).finally(function () {
            deferred.resolve(true);
        });

        return deferred.promise;
    }

    function mapInit(selector) {
        var deferred = $q.defer();

        var mapSelector = selector || 'map';
        $rootScope.map = mapService.initMap(mapSelector);

        initCtrlsTranslation().finally(function () {
            deferred.resolve(true);
        });

        $scope.shouldFitBounds = true;

        if ($state.current.name === 'layout.detail') {
            $scope.showFiltersOnMap = false;
        }

        if ($state.current.name === 'layout.root') {
            $scope.showFiltersOnMap = !!globalSettings.SHOW_FILTERS_ON_MAP;
        }

        return deferred.promise;
    }

    mapInit('map');

    $rootScope.map.on('zoomend', function () {
        if ($state.current.name === 'layout.root') {
            if ((mapService.treksIconified && $rootScope.map.getZoom() >= globalSettings.TREKS_TO_GEOJSON_ZOOM_LEVEL) ||
                (!mapService.treksIconified && $rootScope.map.getZoom() < globalSettings.TREKS_TO_GEOJSON_ZOOM_LEVEL)) {
                mapService.displayResults($scope.results, false);
            }
        }

    });

    var rootScopeEvents = [
        $rootScope.$on('$stateChangeSuccess',
            function () {
                if ($state.current.name === 'layout.detail') {
                    $scope.showFiltersOnMap = false;
                }

                if ($state.current.name === 'layout.root') {
                    $scope.showFiltersOnMap = !!globalSettings.SHOW_FILTERS_ON_MAP;
                }
            }
        ),
        $rootScope.$on('resultsUpdated', function () {
            if ($state.current.name === 'layout.root') {
                updateMapWithResults(globalSettings.UPDATE_MAP_ON_FILTER);
            }
        }),
        $rootScope.$on('detailUpdated', function () {
            if ($state.current.name === 'layout.detail') {
                updateMapWithDetails();
            }
        }),
        $rootScope.$on('switchGlobalLang', function () {
            if ($state.current.name === 'layout.detail') {
                updateMapWithDetails(true);
            } else {
                updateMapWithResults(true);
            }
            initCtrlsTranslation();
        })
    ];

    $scope.$on('$destroy', function () { rootScopeEvents.forEach(function (dereg) { dereg(); }); });

    $scope.$on('$destroy', function (event) {
        var map = $rootScope.map;

        if (map && typeof map.remove === 'function') {
            map.remove();
        }
    });
}

module.exports = {
    MapController : MapController
};
