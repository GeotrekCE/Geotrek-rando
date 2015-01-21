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
                    $scope.results = results;
                    if (callback && typeof callback[0] === 'function') {
                        callback[0](callback[1]);
                    }
                }
            );

    }

    function mapInit(parameters) {

        //$scope.mapService = mapService;

        var mapSelector = parameters[0] || 'map';

        $scope.map = mapService.initMap(mapSelector);

        mapService.displayResults($scope.results);

    }

    updateResults([mapInit, ['map']]);
}

module.exports = {
    MapController : MapController
};