'use strict';

function MapController($scope, settingsFactory, mapService, iconsService, treksService) {
    
    var map;

    function updateTreks(callback) {
        treksService.getTreks()
        .then(
            function(data) {
                $scope.treks = data;
                if (callback && typeof callback[0] === 'function') {
                    callback[0](callback[1]);
                }
            }
        );
    }

    function mapInit(parameters) {

        var mapSelector = parameters[0] || 'map';

        map = mapService.initMap(mapSelector);

        // Load treks in map
        mapService.displayTreks($scope.treks.features);

    }

    updateTreks([mapInit,['map']]);
}

module.exports = {
    MapController : MapController
};