'use strict';

function MapController($scope, $q, globalSettings, mapService, treksService, contentsService, eventsService) {

    function updateResults(callback) {

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
                    $scope.results = results;
                    if (callback && typeof callback[0] === 'function') {
                        callback[0](callback[1]);
                    }
                }
            );

    }

    function mapInit(parameters) {

        var mapSelector = parameters[0] || 'map';

        mapService.initMap(mapSelector);

        // Load treks in map
        mapService.displayTreks($scope.results);

    }

    function updateMap() {
        mapService.displayTreks($scope.results);
    }

    updateResults([mapInit, ['map']]);
}

module.exports = {
    MapController : MapController
};