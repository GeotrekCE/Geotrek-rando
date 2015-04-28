'use strict';

function ResultsListeController($scope, $rootScope, globalSettings, utilsFactory, favoritesService, resultsService) {

    function updateResults(forceRefresh) {
        $rootScope.elementsLoading ++;
        resultsService.getFilteredResults(forceRefresh)
            .then(
                function (data) {
                    $scope.results = data;
                    $rootScope.elementsLoading --;
                },function () {
                    $rootScope.elementsLoading --; 
                }
            );

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
                layerEquivalent = cluster.layer._icon;
            }
        } else {
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
        }
    };

    $scope.favIcon = (globalSettings.FAVORITES_ICON ? globalSettings.FAVORITES_ICON : 'heart');
    $scope.isInFavorites = favoritesService.isInFavorites;
    $scope.isSVG = utilsFactory.isSVG;
    updateResults();

    $scope.$on('updateFilters', function () {
        updateResults();
    });

    $rootScope.$on('switchGlobalLang', function () {
        updateResults(true);
    });

}

module.exports = {
    ResultsListeController: ResultsListeController
};