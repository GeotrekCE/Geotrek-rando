'use strict';

function FiliationController($scope, favoritesService) {
    $scope.isInFavorites = favoritesService.isInFavorites;

    $scope.hoverMarkerFiliation = function (currentPoi, state) {
        var layerEquivalent = document.querySelector('.layer-category-' + currentPoi.properties.category.id + '-' + currentPoi.id);
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

    $scope.toggleFavorites = function (currentElement) {
        if (favoritesService.isInFavorites(currentElement)) {
            favoritesService.removeAFavorite(currentElement);
        } else {
            favoritesService.addAFavorite(currentElement);
        }
    };
}

module.exports = {
    FiliationController: FiliationController
};