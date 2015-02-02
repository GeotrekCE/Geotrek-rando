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

    $scope.isInFavorites = favoritesService.isInFavorites;

    updateResults();

    $scope.$on('updateFilters', function () {
        updateResults();
    });

}


module.exports = {
    ResultsListeController: ResultsListeController
};