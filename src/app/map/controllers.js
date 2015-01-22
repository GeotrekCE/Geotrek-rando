'use strict';

function MapController($scope, resultsService, mapService) {

    function updateResults(callback) {

        resultsService.getAllResults()
            .then(
                function (data) {
                    $scope.results = data;
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