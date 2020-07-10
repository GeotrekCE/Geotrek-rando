'use strict';

function ItemsListController($scope, $filter, globalSettings, favoritesService, $rootScope, mapService, utilsFactory) {

    $scope.parseLength = utilsFactory.parseLength;
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
        if (result.marker instanceof L.Marker) {
            result.marker.fire('click');
        }
    };

    $scope.isInFavorites = favoritesService.isInFavorites;
    $scope.approved = globalSettings.APPROVED_SMALL;
    $scope.approvedLabel = globalSettings.APPROVED_LABEL;
    $scope.enabBooking = globalSettings.ENABLE_BOOKING;
}

module.exports = {
    ItemsListController: ItemsListController
};
