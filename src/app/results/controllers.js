'use strict';

function ResultsListeController($scope, $rootScope, globalSettings, utilsFactory, filtersService) {

    function updateResultsList(forceRefresh) {
        $rootScope.elementsLoading = 1;
        filtersService.getFilteredResults()
        .then(
            function (results) {
                $scope.results = results;
                $rootScope.$emit('resultsUpdated', forceRefresh);
                $rootScope.elementsLoading --;
            },function (err) {
                if (console) {
                    console.error(err);
                }
                $rootScope.elementsLoading --;
            }
        );

    }

    $scope.hoverLayerElement = function hoverLayerElement (currentElement, state) {
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

    $scope.$on('updateResultsList', function (name, forceRefresh) {
        updateResultsList(forceRefresh);
    });


    var rootScopeEvents = [
        $rootScope.$on('switchGlobalLang', function () {
            updateResultsList(true);
        })
    ];

    $scope.$on('$destroy', function () { rootScopeEvents.forEach(function (dereg) { dereg(); }); });

}

module.exports = {
    ResultsListeController: ResultsListeController
};
