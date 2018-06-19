'use strict';

function MapController($q, $scope, globalSettings, $translate, $rootScope, $state, resultsService, filtersService, mapService, centerService, $stateParams, translationService) {

    $scope.currentState = $state.current.name;
    function centerMapOnLastView(fitBounds) {
        var center = centerService.getCenter($scope.currentState);

        if ($scope.shouldSetView && center) {
            fitBounds = false;
            setTimeout(function () {
                $rootScope.map.setView(center.LatLng, center.zoom, {animate:false});
                $scope.shouldSetView = false;
            }, 1000);
        }
    }

    function updateMapWithResults(fitBounds, forceRefresh) {
        var deferred = $q.defer();
        var lang = translationService.getCurrentLang();

        centerMapOnLastView(fitBounds);

        deferred.resolve(
            filtersService.getFilteredResults()
                .then(
                    function () {
                        if ($rootScope.allResults.matchs[lang] > 0) {
                            mapService.displayResults(fitBounds, forceRefresh);
                        } else {
                            mapService.clearAllLayers();
                        }
                    }
                )
        );
        return deferred.promise;
    }

    function updateMapWithDetails(forceRefresh) {
        var deferred = $q.defer();
        var fitBounds = true;
        // centerMapOnLastView(fitBounds);

        var promise;
        if (!forceRefresh) {
            promise = resultsService.getAResultBySlug($stateParams.slug, $stateParams.catSlug, forceRefresh);
        } else {
            promise = resultsService.getAResultByID($scope.result.id, $scope.result.properties.category.id, forceRefresh);
        }

        deferred.resolve(
            promise
                .then(
                    function (data) {
                        $scope.result = data;
                        mapService.displayDetail($scope.result, fitBounds, forceRefresh);
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
                selector: '.simple-services-toggle .toggle-layer',
                isTitle: true,
                translationID: 'SERVICES_TOGGLE'
            },
        ];

        var promises = [];
        _.forEach(controllersListe, function (currentController) {
            var domElement = document.querySelector(currentController.selector);

            if (domElement) {
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
            }
        });

        $q.all(promises).finally(function () {
            deferred.resolve(true);
        });

        return deferred.promise;
    }

    function mapInit(selector) {
        $rootScope.elementsLoading ++;
        var deferred = $q.defer();

        var mapSelector = selector || 'map';
        $rootScope.map = mapService.initMap(mapSelector);

        initCtrlsTranslation().finally(function () {
            deferred.resolve(true);
        });

        $scope.shouldSetView = true;

        if ($state.current.name === 'layout.detail') {
            $rootScope.showFiltersOnMap = false;
        }

        if ($state.current.name === 'layout.root') {
            $rootScope.showFiltersOnMap = !!globalSettings.SHOW_FILTERS_ON_MAP;
        }

        $rootScope.isFullscreen = false;

        return deferred.promise;
    }

    mapInit('map');


    $rootScope.map.on('zoomend', function () {
        if ($state.current.name === 'layout.root') {
            if ((mapService.treksIconified && $rootScope.map.getZoom() >= globalSettings.TREKS_TO_GEOJSON_ZOOM_LEVEL) ||
                (!mapService.treksIconified && $rootScope.map.getZoom() < globalSettings.TREKS_TO_GEOJSON_ZOOM_LEVEL)) {
                mapService.displayResults(false);
            }
        }

    });

    $rootScope.map.on('fullscreenchange', function () {
        if ($rootScope.map.isFullscreen()) {
            $rootScope.isFullscreen = true;
                $rootScope.$digest();
                setTimeout(function() {
                    $rootScope.map.invalidateSize(true);
                }, 1000);
        } else {
            $rootScope.isFullscreen = false;
            $rootScope.$digest();
            setTimeout(function() {
                $rootScope.map.invalidateSize(false);
            }, 1000);
        }
    });

    var rootScopeEvents = [
        $rootScope.$on('$stateChangeStart',
            function () {
                $rootScope.elementsLoading = 1;
                var map = $rootScope.map;
                centerService.setCenter(map.getCenter(), map.getZoom(), $scope.currentState);

                if (map && typeof map.remove === 'function') {
                    map.remove();
                }
            }
        ),
        $rootScope.$on('$stateChangeSuccess',
            function () {
                if ($state.current.name === 'layout.detail') {
                    $rootScope.showFiltersOnMap = false;
                }

                if ($state.current.name === 'layout.root') {
                    $rootScope.showFiltersOnMap = !!globalSettings.SHOW_FILTERS_ON_MAP;
                }
            }
        ),
        $rootScope.$on('resultsUpdated', function (name, forceRefresh) {
            forceRefresh = !!forceRefresh;
            if ($state.current.name === 'layout.root') {
                $rootScope.elementsLoading = 1;
                updateMapWithResults(globalSettings.UPDATE_MAP_ON_FILTER, forceRefresh).then(function() {
                    $rootScope.elementsLoading --;
                });
            }
        }),
        $rootScope.$on('detailUpdated', function (name, forceRefresh) {
            if ($state.current.name === 'layout.detail' && !forceRefresh) {
                $rootScope.elementsLoading = 1;
                updateMapWithDetails(forceRefresh).then(function() {
                    $rootScope.elementsLoading --;
                });
            }
        }),
        $rootScope.$on('switchGlobalLang', function () {
            initCtrlsTranslation();
        })
    ];

    $scope.$on('$destroy', function () { rootScopeEvents.forEach(function (dereg) { dereg(); }); });
}

function ViewportFilterController($scope, mapService) {
    /**
     * Viewport filtering model and ng-change callback.
     */
    $scope.viewportFilterCheckbox = mapService.filterByViewport;
    $scope.onViewportFilterChange = function onViewportFilterChange () {
        mapService.setViewPortFilterState($scope.viewportFilterCheckbox);
    };
}

module.exports = {
    MapController : MapController,
    ViewportFilterController: ViewportFilterController,
};
