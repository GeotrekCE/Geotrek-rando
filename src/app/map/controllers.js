'use strict';

function MapController($scope, settingsFactory, mapService, iconsService) {
    
    var map, treksLayer;

    var treks = $scope.treks;

    function mapInit(mapId) {

        var mapParameters = mapService.getMapInitParameters();

        map = L.map(mapId, mapParameters);

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
        angular.forEach(treks.features/*filterFilter($rootScope.filteredTreks, $scope.activeFilters.search)*/, function(trek) {
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

    mapInit('map');
}

module.exports = {
    MapController : MapController
};