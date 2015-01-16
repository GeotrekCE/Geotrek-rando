'use strict';

function MapController($scope, settingsFactory, mapService, iconsService, treksService) {
    
    var map, treksLayer;

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
        var mapParameters = mapService.getMapInitParameters(),
            mapSelector = parameters[0] || 'map';

        map = L.map(mapSelector, mapParameters);

        treksLayer = new L.MarkerClusterGroup({
            showCoverageOnHover: false,
            iconCreateFunction: function(cluster) {
                return iconsService.getClusterIcon(cluster);
            }
        });
        $scope.treksLayer = treksLayer;

        // Show the scale and attribution controls
        mapService.setScale(map);
        mapService.setAttribution(map);
        showTreks();

    }

     // Add treks geojson to the map
    function showTreks() {
        // Remove all markers so the displayed markers can fit the search results
        treksLayer.clearLayers();

        //$scope.mapService = mapService;
        angular.forEach($scope.treks.features/*filterFilter($rootScope.filteredTreks, $scope.activeFilters.search)*/, function(trek) {
            var trekDeparture = mapService.createClusterMarkerFromTrek(trek);
            trekDeparture.on({
                click: function(e) {
                    console.log('marker Clicked');
                    //$state.go("home.map.detail", { trekId: trek.id });
                }
            });
            treksLayer.addLayer(trekDeparture);
        });
        map.addLayer(treksLayer);

        /*if ((updateBounds == undefined) || (updateBounds == true)) {    
            map.fitBounds(treksLayer.getBounds());
        }*/
    };

    updateTreks([mapInit,['map']]);
}

module.exports = {
    MapController : MapController
};