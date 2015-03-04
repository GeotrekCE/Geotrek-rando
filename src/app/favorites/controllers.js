'use strict';

function FavoritesController($scope, favoritesService, resultsService) {

    function updateFavorites(forceRefresh) {
        var savedFavorites = favoritesService.getFavorites(forceRefresh);
        $scope.favorites = [];
        if (_.size(savedFavorites) > 0) {
            _.forEach(savedFavorites, function (aFavorite) {
                resultsService.getAResultBySlug(aFavorite.slug)
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
        updateFavorites();
    };

    $scope.removeAllFavorites = function () {
        favoritesService.removeAllFavorites();
        updateFavorites();
    };

    $scope.addAFavorite = function (currentElement) {
        favoritesService.addAFavorite(currentElement);
        updateFavorites();
    };

    updateFavorites();

    $scope.$on('switchGlobalLang', function () {
        updateFavorites(true);
    });

    $scope.$on('changeFavorite', function (event, args) {
        if (args.action === 'add') {
            $scope.addAFavorite(args.element);
        } else if (args.action === 'remove') {
            $scope.removeAFavorite(args.element);
        }
    });

}

module.exports = {
    FavoritesController: FavoritesController
};