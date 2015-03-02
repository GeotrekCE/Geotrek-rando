'use strict';

function FavoritesController($scope, favoritesService, resultsService) {

    $scope.updateFavorites = function () {
        var savedFavorites = favoritesService.getFavorites();
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
    };

    $scope.removeAFavorite = function (currentElement) {
        favoritesService.removeAFavorite(currentElement);
        $scope.updateFavorites();
    };

    $scope.removeAllFavorites = function () {
        favoritesService.removeAllFavorites();
        $scope.updateFavorites();
    };

    $scope.addAFavorite = function (currentElement) {
        favoritesService.addAFavorite(currentElement);
        $scope.updateFavorites();
    };

    $scope.updateFavorites();

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