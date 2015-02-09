'use strict';

function ResultsListeController($scope, $rootScope, favoritesService, resultsService) {

    function updateResults() {

        resultsService.getFilteredResults()
            .then(
                function (data) {
                    $scope.results = data;
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
        var layerEquivalent = document.querySelector('.layer-' + currentElement.category.name + '-' + currentElement.id);
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

    updateResults();

    $scope.$on('updateFilters', function () {
        updateResults();
    });

}


module.exports = {
    ResultsListeController: ResultsListeController
};