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
                            var i;
                            for (i = 0; i < treks.features.length; i++) {
                                results.push(treks.features[i]);
                            }
                        }
                    )
            );
        }

        if (globalSettings.ENABLE_TOURISTIC_CONTENT) {
            promises.push(
                contentsService.getContents()
                    .then(
                        function (contents) {
                            var i;
                            for (i = 0; i < contents.length; i++) {
                                results.push(contents[i]);
                            }
                        }
                    )
            );
        }

        if (globalSettings.ENABLE_TOURISTIC_EVENTS) {
            promises.push(
                eventsService.getEvents()
                    .then(
                        function (trEvents) {
                            var i;
                            for (i = 0; i < trEvents.length; i++) {
                                results.push(trEvents[i]);
                            }
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