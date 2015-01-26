'use strict';

function MapController($scope, $rootScope, $state, resultsService, mapService, $stateParams) {

    function updateMapWithResults() {

        resultsService.getAllResults()
            .then(
                function (data) {
                    $scope.results = data;
                    mapService.displayResults($scope.results);
                }
            );

    }

    function updateMapWithDetails() {
        resultsService.getAResult($stateParams.slug)
            .then(
                function (data) {
                    $scope.result = data;
                    mapService.displayDetail($scope.result);
                }
            );
    }

    function mapInit(selector) {

        var mapSelector = selector || 'map';
        $scope.map = mapService.initMap(mapSelector);
        if ($state.current.name === 'layout.detail') {
            updateMapWithDetails();
        } else {
            updateMapWithResults();
        }

    }

    mapInit('map');

    $rootScope.$on('$stateChangeSuccess',
        function () {
            if ($state.current.name === 'layout.detail') {
                updateMapWithDetails();
            } else {
                updateMapWithResults();
            }
        });
}

module.exports = {
    MapController : MapController
};