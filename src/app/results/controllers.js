'use strict';

function ResultsListeController($scope, $q, globalSettings, treksService, contentsService, eventsService) {

    function updateResults() {

        var promises = [],
            results = [];

        if (globalSettings.ENABLE_TREKS) {
            promises.push(
                treksService.getTreks()
                    .then(
                        function (treks) {
                            _.forEach(treks.features, function (trek) {
                                results.push(trek);
                            });
                        }
                    )
            );
        }

        if (globalSettings.ENABLE_TOURISTIC_CONTENT) {
            promises.push(
                contentsService.getContents()
                    .then(
                        function (contents) {
                            _.forEach(contents.features, function (content) {
                                results.push(content);
                            });
                        }
                    )
            );
        }

        if (globalSettings.ENABLE_TOURISTIC_EVENTS) {
            promises.push(
                eventsService.getEvents()
                    .then(
                        function (trEvents) {
                            _.forEach(trEvents.features, function (trEvent) {
                                results.push(trEvent);
                            });
                        }
                    )

            );
        }

        $q.all(promises)
            .then(
                function () {
                    console.log(results);
                    $scope.results = results;
                }
            );
    }

    updateResults();

}


module.exports = {
    ResultsListeController: ResultsListeController
};