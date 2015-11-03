'use strict';

function ResultsListeController($scope, $rootScope, globalSettings, utilsFactory, favoritesService, filtersService, mapService) {

    function updateResults(forceRefresh) {
        $rootScope.elementsLoading ++;
        filtersService.getFilteredResults(forceRefresh)
            .then(
                function (results) {
                    $scope.results = results;
                    startLazyLoading();
                    $rootScope.$emit('resultsUpdated');
                    $rootScope.elementsLoading --;
                },function (err) {
                    if (console) {
                        console.error(err);
                    }
                    $rootScope.elementsLoading --; 
                }
            );

    }

    function startLazyLoading () {
        $scope.resultsDisplayLimit = 20;
        var resultsInterval = setInterval(function () {
            if ($scope.resultsDisplayLimit < $scope.results.length) {
                $scope.resultsDisplayLimit += 20;
            } else {
                clearInterval(resultsInterval);
            }
        }, 300);
    }

    $scope.toggleFavorites = function (currentElement) {
        var currentAction = '';
        if (favoritesService.isInFavorites(currentElement)) {
            currentAction = 'remove';
        } else {
            currentAction = 'add';
        }
        $rootScope.$broadcast('changeFavorite', {element: currentElement, action: currentAction});
    };

    $scope.hoverLayerElement = function (currentElement, state) {
        var layerEquivalent = document.querySelectorAll('.layer-category-' + currentElement.properties.category.id + '-' + currentElement.id);

        if (layerEquivalent.length === 0) {
            var mapLayers = [];
            $rootScope.map.eachLayer(function (currentLayer) {
                if (currentLayer._childCount) {
                    mapLayers.push(currentLayer);
                }
            });
            var position = utilsFactory.getStartPoint(currentElement);
            var cluster = L.GeometryUtil.closestLayer($rootScope.map, mapLayers, position);
            if (cluster) {
                layerEquivalent = [cluster.layer._icon];
            }
        }
        _.each(layerEquivalent, function (selectedLayer) {
            if (selectedLayer) {
                if (state === 'enter') {
                    if (!selectedLayer.classList.contains('hovered')) {
                        selectedLayer.classList.add('hovered');
                    }
                } else {
                    if (selectedLayer.classList.contains('hovered')) {
                        selectedLayer.classList.remove('hovered');
                    }
                }
            }
        });
    };

    $scope.mapFocusOn = function (result) {
        $rootScope.mapIsShown = true;
        mapService.centerOn(result);
    };

    $scope.isInFavorites = favoritesService.isInFavorites;
    $scope.isSVG = utilsFactory.isSVG;

    $scope.$on('updateFilters', function () {
        updateResults();
    });

    var rootScopeEvents = [
        $rootScope.$on('switchGlobalLang', function () {
            updateResults(true);
        })
    ];

    $scope.$on('$destroy', function () { rootScopeEvents.forEach(function (dereg) { dereg(); }); });

}

module.exports = {
    ResultsListeController: ResultsListeController
};
