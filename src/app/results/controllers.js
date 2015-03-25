'use strict';

function ResultsListeController($scope, $rootScope, utilsFactory, favoritesService, resultsService) {

    function updateResults(forceRefresh) {

        resultsService.getFilteredResults(forceRefresh)
            .then(
                function (data) {
                    $scope.results = data;
                    //console.log(data);
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
        var layerEquivalent = document.querySelector('.layer-category-' + currentElement.properties.category.id + '-' + currentElement.id);
        if (layerEquivalent !== null) {
            if (state === 'enter') {
                if (!layerEquivalent.classList.contains('hovered')) {
                    layerEquivalent.classList.add('hovered');
                }
            } else {
                if (layerEquivalent.classList.contains('hovered')) {
                    layerEquivalent.classList.remove('hovered');
                }
            }
        }
    };

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