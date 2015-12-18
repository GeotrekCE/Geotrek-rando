'use strict';

function ItemsListController($scope, globalSettings, favoritesService, $rootScope, mapService) {

    $scope.toggleFavorites = function (currentElement) {
        var currentAction = '';
        if (favoritesService.isInFavorites(currentElement)) {
            currentAction = 'remove';
        } else {
            currentAction = 'add';
        }
        $rootScope.$broadcast('changeFavorite', {element: currentElement, action: currentAction});
    };

    $scope.mapFocusOn = function (result) {
        $rootScope.mapIsShown = true;
        mapService.centerOn(result);
    };

    $scope.isInFavorites = favoritesService.isInFavorites;
    $scope.approved = globalSettings.APPROVED_SMALL;
    $scope.approvedLabel = globalSettings.APPROVED_LABEL;
}

module.exports = {
    ItemsListController: ItemsListController
};
