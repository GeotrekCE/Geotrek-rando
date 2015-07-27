'use strict';

function FavoritesController($scope, $rootScope, globalSettings, favoritesService, resultsService) {

    $scope.favIcon = (globalSettings.FAVORITES_ICON ? globalSettings.FAVORITES_ICON : 'heart');

    function updateFavorites(forceRefresh) {
        var savedFavorites = favoritesService.getFavorites();
        $scope.favorites = [];
        if (_.size(savedFavorites) > 0) {
            _.forEach(savedFavorites, function (aFavorite) {
                resultsService.getAResultByID(aFavorite.id, aFavorite.category, forceRefresh)
                    .then(
                        function (result) {
                            $scope.favorites.push(result);
                        }
                    );
            });
        }
    }

    $scope.removeAFavorite = function (currentElement) {
        favoritesService.removeAFavorite(currentElement);
    };

    $scope.removeAllFavorites = function () {
        favoritesService.removeAllFavorites();
    };

    updateFavorites();
    favoritesService.addCallback(updateFavorites);

    $rootScope.$on('switchGlobalLang', function () {
        updateFavorites(true);
    });

}

module.exports = {
    FavoritesController: FavoritesController
};