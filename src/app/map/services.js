'use strict';

function mapService($q, settingsFactory, treksService, iconsService) {

    var _markers = [];

    this.getMarkers = function() {
        return _markers;
    };

    this.setMarkers = function(markers) {
        _markers = markers;
    };

    this.getMapInitParameters = function() {
        // Set default Leaflet map params

        var map_parameters = {
            center: [settingsFactory.LEAFLET_CONF.CENTER_LATITUDE, settingsFactory.LEAFLET_CONF.CENTER_LONGITUDE],
            zoom: settingsFactory.LEAFLET_CONF.DEFAULT_ZOOM,
            minZoom: settingsFactory.LEAFLET_CONF.DEFAULT_MIN_ZOOM,
            maxZoom: settingsFactory.LEAFLET_CONF.DEFAULT_MAX_ZOOM,
            scrollWheelZoom: true,
            zoomControl: false,
            layers: L.tileLayer(settingsFactory.LEAFLET_BACKGROUND_URL)
        };

        return map_parameters;
    };

    this.createMarkersFromTrek = function(trek, pois) {
        var markers = [];

        var startPoint = treksService.getStartPoint(trek);
        var endPoint = treksService.getEndPoint(trek);
        var parkingPoint = treksService.getParkingPoint(trek);

        markers.push(L.marker([endPoint.lat, endPoint.lng], {
            icon: iconsService.getArrivalIcon(),
            name: trek.properties.arrival,
        }));

        markers.push(L.marker([startPoint.lat, startPoint.lng], {
            icon: iconsService.getDepartureIcon(),
            name: trek.properties.departure,
        }));

        if(parkingPoint) {
            markers.push(L.marker([parkingPoint.lat, parkingPoint.lng], {
            icon: iconsService.getParkingIcon(),
            name: "Parking",
            description: trek.properties.advised_parking,
            }));
        };

        var informationCount = 0;
        angular.forEach(trek.properties.information_desks, function(information) {
            var informationDescription = "<p>" + information.description + "</p>"
                + "<p>" + information.street + "</p>"
                + "<p>" + information.postal_code + " " + information.municipality + "</p>"
                + "<p><a href='" + information.website + "'>Web</a> - <a href='tel:" + information.phone + "'>" + information.phone + "</a></p>";

            markers.push(L.marker([information.latitude, information.longitude], {
                icon: iconsService.getInformationIcon(),
                name: information.name,
                thumbnail: information.photo_url,
                description: informationDescription,
            }));
            informationCount += 1;
        });

        angular.forEach(pois, function(poi) {
            var poiCoords = {
                'lat': poi.geometry.coordinates[1],
                'lng': poi.geometry.coordinates[0]
            };
            var poiIcon = iconsService.getPOIIcon(poi);
            markers.push(L.marker([poiCoords.lat, poiCoords.lng], {
                icon: poiIcon,
                name: poi.properties.name,
                description: poi.properties.description,
                thumbnail: poi.properties.thumbnail,
                img: poi.properties.pictures[0],
                pictogram: poi.properties.type.pictogram
            }));
        });

        return markers;
    };

    this.createClusterMarkerFromTrek = function(trek) {
        var startPoint = treksService.getStartPoint(trek);

        var marker = L.marker([startPoint.lat, startPoint.lng], {
            icon: iconsService.getTrekIcon()
        });

        return marker;
    };

    this.setScale = function(map) {
        L.control.scale({imperial: false}).addTo(map);
    };

    this.setAttribution = function(map) {
        map.attributionControl.setPrefix(settingsFactory.LEAFLET_CONF.ATTRIBUTION);
    };

    this.setPositionMarker = function() {

        // Pulsing marker inspired by
        // http://blog.thematicmapping.org/2014/06/real-time-tracking-with-spot-and-leafet.html
        return {
            radius: 7,
            color: 'black',
            fillColor: '#981d97',
            fillOpacity: 1,
            type: 'circleMarker',
            className: 'leaflet-live-user',
            weight: 2
        };
    }

}

function iconsService($window) {

    var trek_icons = {
        default_icon: {},
        departure_icon: L.icon({
            iconUrl: 'images/marker-source.png',
            iconSize: [64, 64],
            iconAnchor: [32, 64],
            labelAnchor: [20, -50]
        }),
        arrival_icon: L.icon({
            iconUrl: 'images/marker-target.png',
            iconSize: [64, 64],
            iconAnchor: [32, 64],
            labelAnchor: [20, -50]
        }),
        parking_icon: L.icon({
            iconUrl: 'images/parking.png',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        }),
        information_icon: L.icon({
            iconUrl: 'images/information.svg',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        }),
        poi_icon: L.icon({
            iconSize: [40, 40],
            labelAnchor: [20, -50]
        }),
        trek_icon: L.divIcon({
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            className: 'trek-icon',
            labelAnchor: [20, 0]
        })
    };

    this.getPOIIcon = function(poi) {
        var pictogramUrl = poi.properties.type.pictogram;

        return L.icon({
            iconUrl: pictogramUrl,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        })
    };

    this.getClusterIcon = function(cluster) {
        return new L.DivIcon({
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            className: 'trek-cluster',
            html: '<span class="count">' + cluster.getChildCount() + '</span>'
        });
    };

    this.getDepartureIcon = function() {
        return trek_icons.departure_icon;
    };

    this.getArrivalIcon = function() {
        return trek_icons.arrival_icon;
    };

    this.getParkingIcon = function() {
        return trek_icons.parking_icon;
    };

    this.getInformationIcon = function() {
        return trek_icons.information_icon;
    };

    this.getTrekIcon = function() {
        return trek_icons.trek_icon;
    };

}

module.exports = {
    mapService: mapService,
    iconsService: iconsService
};