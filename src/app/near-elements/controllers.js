'use strict';

function NearListeController($scope, globalSettings, favoritesService, $rootScope) {

    $scope.favIcon = (globalSettings.FAVORITES_ICON ? globalSettings.FAVORITES_ICON : 'heart');
    $scope.isInFavorites = favoritesService.isInFavorites;

    $scope.hoverMarkerNear = function (currentPoi, state) {
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
        var currentAction = '';
        if (favoritesService.isInFavorites(currentElement)) {
            currentAction = 'remove';
        } else {
            currentAction = 'add';
        }
        $rootScope.$broadcast('changeFavorite', {element: currentElement, action: currentAction});
    };
}

module.exports = {
    NearListeController: NearListeController
};