'use strict';

function ResultsListeController($scope, resultsService) {

    function updateResults() {

        resultsService.getFilteredResults()
            .then(
                function (data) {
                    $scope.results = data;
                }
            );

    }

    updateResults();

}


module.exports = {
    ResultsListeController: ResultsListeController
};