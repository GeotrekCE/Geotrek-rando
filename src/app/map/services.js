'use strict';

function mapService($q, utilsFactory, globalSettings, treksService, iconsService) {

    var self = this,
        loadingMarkers = false;

    this.createLayer = function () {

        var layer = new L.LayerGroup();

        return layer;

    };

    this.createClusterLayer = function () {

        var clusterLayer = new L.MarkerClusterGroup({
            showCoverageOnHover: false,
            iconCreateFunction: function (cluster) {
                return iconsService.getClusterIcon(cluster);
            }
        });

        return clusterLayer;

    };

    this.createGeoJSONLayer = function () {

        var layer = new L.geoJson();

        return layer;
    };

    this.clearAllLayers = function () {
        // Remove all markers so the displayed markers can fit the search results
        self._clustersLayer.clearLayers();

        if (globalSettings.ENABLE_TREKS) {
            self._treksMarkersLayer.clearLayers();
            self._treksgeoJsonLayer.clearLayers();
        }

        if (globalSettings.ENABLE_TOURISTIC_CONTENT || globalSettings.ENABLE_TOURISTIC_EVENTS) {
            self._touristicsMarkersLayer.clearLayers();
        }

    };

    this.updateBounds = function (updateBounds, layer) {

        if ((updateBounds === undefined) || (updateBounds === true)) {
            self.map.fitBounds(layer.getBounds());
        }

    };

    // Add treks geojson to the map
    this.displayResults = function (results, updateBounds) {

        var counter = 0;

        if (!self.loadingMarkers) {
            self.loadingMarkers = true;

            this.treksIconified = this.map.getZoom() < globalSettings.TREKS_TO_GEOJSON_ZOOM_LEVEL;
            this.clearAllLayers();

            _.forEach(results, function (result) {

                counter++;

                var currentLayer,
                    currentCount = counter,
                    type = '',
                    listeEquivalent;

                if (result.geometry.type !== "Point" && !self.treksIconified) {
                    currentLayer = self._treksgeoJsonLayer;
                    type = 'geojson';
                } else {
                    currentLayer = self._touristicsMarkersLayer;
                    type = 'marker';
                }

                self.createLayerFromElement(result, type)
                    .then(
                        function (layer) {
                            layer.on({
                                mouseover: function () {
                                    listeEquivalent = jQuery('#result-' + result.category.name + '-' + result.id);
                                    if (!listeEquivalent.hasClass('hovered')) {
                                        listeEquivalent.addClass('hovered');
                                    }
                                },
                                mouseout: function () {
                                    listeEquivalent = jQuery('#result-' + result.category.name + '-' + result.id);
                                    if (listeEquivalent.hasClass('hovered')) {
                                        listeEquivalent.removeClass('hovered');
                                    }
                                },
                                click: function () {
                                    console.log('marker Clicked');
                                    //$state.go("home.map.detail", { trekId: result.id });
                                }
                            });
                            currentLayer.addLayer(layer);
                            self._clustersLayer.addLayer(currentLayer);
                            if (currentCount === _.size(results)) {
                                self.updateBounds(updateBounds, self._clustersLayer);
                                self.loadingMarkers = false;
                            }
                        }
                    );

            });
        }

    };

    this.displayDetail = function (result, updateBounds) {

        var type = '',
            currentLayer;

        if (!self.loadingMarkers) {

            self.loadingMarkers = true;

            this.clearAllLayers();

            if (result.geometry.type !== "Point") {
                currentLayer = self._treksgeoJsonLayer;
                type = 'geojson';

            } else {
                currentLayer = self._touristicsMarkersLayer;
                type = 'marker';
            }

            self.createLayerFromElement(result, type)
                .then(
                    function (layer) {
                        currentLayer.addLayer(layer);
                        self._clustersLayer.addLayer(currentLayer);

                        if (result.geometry.type !== "Point") {
                            self.updateBounds(updateBounds, currentLayer);
                        } else {
                            self.updateBounds(updateBounds, self._clustersLayer);
                        }

                        self.loadingMarkers = false;
                    }
                );
        }

    };

    this.initMap = function (mapSelector) {

        // Set background Layers
        this._baseLayers = {
            main: L.tileLayer(
                globalSettings.MAIN_LEAFLET_BACKGROUND.LAYER_URL,
                {
                    id: 'main',
                    attribution: globalSettings.MAIN_LEAFLET_BACKGROUND.ATTRIBUTION
                }
            ),
            satellite: L.tileLayer(
                globalSettings.SATELLITE_LEAFLET_BACKGROUND.LAYER_URL,
                {
                    id: 'satellite',
                    attribution: globalSettings.SATELLITE_LEAFLET_BACKGROUND.ATTRIBUTION
                }
            )
        };

        var mapParameters = {
            center: [globalSettings.LEAFLET_CONF.CENTER_LATITUDE, globalSettings.LEAFLET_CONF.CENTER_LONGITUDE],
            zoom: globalSettings.LEAFLET_CONF.DEFAULT_ZOOM,
            minZoom: globalSettings.LEAFLET_CONF.DEFAULT_MIN_ZOOM,
            maxZoom: globalSettings.LEAFLET_CONF.DEFAULT_MAX_ZOOM,
            scrollWheelZoom: true,
            layers: this._baseLayers.main
        };

        //Mixins for map
        this.initCustomsMixins();

        this.map = L.map(mapSelector, mapParameters);

        // Set-up maps controls (needs _map to be defined);
        this.initMapControls();

        //Set-up Layers
        this._clustersLayer = self.createClusterLayer();

        if (globalSettings.ENABLE_TREKS) {
            this._treksMarkersLayer = self.createLayer();
            this._treksgeoJsonLayer = self.createGeoJSONLayer();
        }

        if (globalSettings.ENABLE_TOURISTIC_CONTENT || globalSettings.ENABLE_TOURISTIC_EVENTS) {
            this._touristicsMarkersLayer = self.createLayer();
        }

        this.map.addLayer(this._clustersLayer);

        return this.map;

    };



    // MARKERS AND CLUSTERS  //////////////////////////////
    //
    //
    this.markers = [];

    this.getMarkers = function () {
        return this.markers;
    };

    this.setMarkers = function (markers) {
        this.markers = markers;
    };

    /*this.createMarkersFromTrek = function (trek, pois) {
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

        if (parkingPoint) {
            markers.push(
                L.marker(
                    [parkingPoint.lat, parkingPoint.lng],
                    {
                        icon: iconsService.getParkingIcon(),
                        name: "Parking",
                        description: trek.properties.advised_parking,
                    }
                )
            );
        }

        var informationCount = 0;
        _.forEach(trek.properties.information_desks, function (information) {
            var informationDescription = "<p>" + information.description + "</p>"
                + "<p>" + information.street + "</p>"
                + "<p>" + information.postal_code + " " + information.municipality + "</p>"
                + "<p><a href='" + information.website + "'>Web</a> - <a href='tel:" + information.phone + "'>" + information.phone + "</a></p>";

            markers.push(
                L.marker(
                    [information.latitude, information.longitude],
                    {
                        icon: iconsService.getInformationIcon(),
                        name: information.name,
                        thumbnail: information.photo_url,
                        description: informationDescription,
                    }
                )
            );
            informationCount += 1;
        });

        _.forEach(pois, function (poi) {
            var poiCoords = {
                'lat': poi.geometry.coordinates[1],
                'lng': poi.geometry.coordinates[0]
            };
            var poiIcon = iconsService.getPOIIcon(poi);
            markers.push(
                L.marker([poiCoords.lat, poiCoords.lng],
                    {
                        icon: poiIcon,
                        name: poi.properties.name,
                        description: poi.properties.description,
                        thumbnail: poi.properties.thumbnail,
                        img: poi.properties.pictures[0],
                        pictogram: poi.properties.type.pictogram
                    })
            );
        });

        return markers;
    };*/

    this.createLayerFromElement = function (element, type) {
        var deferred = $q.defer();

        if (type === "geojson") {
            var geoStyle = {
                weight: 5,
                opacity: 0.65,
                className: element.category.name
            };

            if (element.geometry.type === 'Polygon') {
                geoStyle.className += ' fill';
            }

            deferred.resolve(L.geoJson(element, {
                style: geoStyle
            }));
        } else {
            var startPoint = {};

            if (element.geometry.type !== "Point") {
                startPoint = utilsFactory.getStartPoint(element);
            } else {
                startPoint.lng = element.geometry.coordinates[0];
                startPoint.lat = element.geometry.coordinates[1];
            }

            iconsService.getIcon(element.category)
                .then(
                    function (currentIcon) {

                        var marker = L.marker(
                            [startPoint.lat, startPoint.lng],
                            {
                                icon: currentIcon
                            }
                        );

                        deferred.resolve(marker);
                    }
                );
        }

        return deferred.promise;
    };


    // UI CONTROLS //////////////////////////////
    //
    //

    this.initMapControls = function () {
        this.setScale();
        this.setAttribution();
        this.setZoomControlPosition();
        this.setFullScreenControl();
        this.setMinimap();
        this.createSatelliteView();
    };

    this.setScale = function () {
        L.control.scale({imperial: false}).addTo(this.map);
    };

    this.setZoomControlPosition = function () {
        this.map.zoomControl.setPosition('topright');
    };

    this.setFullScreenControl = function () {
        L.control.fullscreen({
            position: 'topright',
            title: 'Fullscreen'
        }).addTo(this.map);
    };

    this.setMinimap = function () {
        var miniMapLayer = new L.tileLayer(
                globalSettings.MAIN_LEAFLET_BACKGROUND.LAYER_URL,
                {
                    minZoom: 0,
                    maxZoom: 13,
                    attribution: globalSettings.MAIN_LEAFLET_BACKGROUND.ATTRIBUTION
                }
            ),
            miniMapOptions = {
                toggleDisplay: true,
                zoomLevelOffset: -3
            };

        this._miniMap = new L.Control.MiniMap(miniMapLayer, miniMapOptions).addTo(this.map);
    };

    this.setAttribution = function () {
        this.map.attributionControl.setPrefix(globalSettings.LEAFLET_CONF.ATTRIBUTION);
    };

    this.setPositionMarker = function () {

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
    };

    this.createSatelliteView = function () {
        L.Control.SwitchBackgroundLayers = L.Control.extend({
            options: {
                position: 'bottomleft',
            },

            onAdd: function (map) {

                this.map = map;

                this.switch_detail_zoom = jQuery(map._container).data('switch-detail-zoom');
                if (this.switch_detail_zoom > 0) {
                    map.on('zoomend', function (e) {
                        if (map.isShowingLayer('satellite')) {
                            return;
                        }
                        if (e.target.getZoom() > this.switch_detail_zoom) {
                            if (!map.isShowingLayer('detail')) {
                                setTimeout(function () { map.switchLayer('detail'); }, 100);
                            }
                        } else {
                            if (!map.isShowingLayer('main')) {
                                setTimeout(function () { map.switchLayer('main'); }, 100);
                            }
                        }
                    }, this);
                }

                this._container = L.DomUtil.create('div', 'simple-layer-switcher');

                var className = 'toggle-layer background satellite';

                this.button = L.DomUtil.create('a', className, this._container);
                this.button.setAttribute('title', 'Show satellite');
                jQuery(this.button).tooltip({placement: 'right',
                                        container: map._container});

                L.DomEvent.disableClickPropagation(this.button);
                L.DomEvent.on(this.button, 'click', function () {
                    this.toggleLayer();
                }, this);

                return this._container;
            },

            toggleLayer: function () {

                if (this.map.isShowingLayer('main') || this.map.isShowingLayer('detail')) {
                    this.map.switchLayer('satellite');

                    L.DomUtil.removeClass(this.button, 'satellite');
                    L.DomUtil.addClass(this.button, 'main');
                    this.button.setAttribute('title', 'Show plan');
                } else {
                    this.map.switchLayer(this.map.getZoom() > this.switch_detail_zoom ? 'detail' : 'main');

                    L.DomUtil.removeClass(this.button, 'main');
                    L.DomUtil.addClass(this.button, 'satellite');
                    this.button.setAttribute('title', 'Show satellite');
                }

                jQuery(this.button).tooltip('destroy');
                jQuery(this.button).tooltip({placement: 'right',
                                        container: this.map._container});
            }

        });

        var switchControl = new L.Control.SwitchBackgroundLayers();
        switchControl.addTo(this.map);
    };


    // CUSTOM MIXINS //////////////////////////////
    //
    //
    this.initCustomsMixins = function () {
        this.addMapLayersMixin();
        this.topPadding();
    };

    this.addMapLayersMixin = function () {
        var LayerSwitcherMixin = {

            isShowingLayer: function (name) {
                if (this.hasLayer(self._baseLayers[name])) {
                    return true;
                }
                return false;
            },

            switchLayer: function (destLayer) {
                var base;
                for (base in self._baseLayers) {
                    if (this.hasLayer(self._baseLayers[base]) && self._baseLayers[base] !== self._baseLayers[destLayer]) {
                        this.removeLayer(self._baseLayers[base]);
                    }
                }
                this.addLayer(self._baseLayers[destLayer]);
            }
        };

        L.Map.include(LayerSwitcherMixin);
    };

    this.topPadding = function () {
        L.LatLngBounds.prototype.padTop = function (bufferRatio) {
            var sw = this._southWest,
                ne = this._northEast,
                heightBuffer = Math.abs(sw.lat - ne.lat) * bufferRatio;

            return new L.LatLngBounds(
                new L.LatLng(sw.lat, sw.lng),
                new L.LatLng(ne.lat + heightBuffer, ne.lng)
            );

        };
    };

}

function iconsService($http, $q, categoriesService) {

    var self = this;

    var map_icons = {
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
        })
    };

    this.getCategoriesIcons = function () {

        var deferred = $q.defer();

        if (self.categoriesIcons) {
            deferred.resolve(self.categoriesIcons);
        } else {

            categoriesService.getCategories()
                .then(
                    function (categories) {
                        var counter = 0;
                        _.forEach(categories, function (category) {
                            if (!self.categoriesIcons) {
                                self.categoriesIcons = {};
                            }
                            counter++;
                            var currentCounter = counter;
                            $http.get(category.pictogram)
                                .success(
                                    function (icon) {
                                        self.categoriesIcons[category.id] = icon.toString();
                                        if (currentCounter === _.size(categories)) {
                                            deferred.resolve(self.categoriesIcons);
                                        }
                                    }
                                ).error(
                                    function () {
                                        self.categoriesIcons[category.id] = '';
                                        if (currentCounter === _.size(categories)) {
                                            deferred.resolve(self.categoriesIcons);
                                        }
                                    }
                                );
                        });
                    }
                );
        }

        return deferred.promise;
    };

    this.getCategoryIcon = function (categoryId) {

        var deferred = $q.defer();

        if (self.categoriesIcons) {
            deferred.resolve(self.categoriesIcons[categoryId]);
        } else {
            self.getCategoriesIcons()
                .then(
                    function (icons) {
                        deferred.resolve(icons[categoryId]);
                    }
                );
        }

        return deferred.promise;
    };

    this.getMarkerIcon = function () {
        var deferred = $q.defer();

        if (self.markerIcon) {
            deferred.resolve(self.markerIcon);
        } else {

            $http.get('/images/map/marker.svg')
                .success(
                    function (icon) {
                        self.markerIcon = icon.toString();
                        deferred.resolve(self.markerIcon);
                    }
                ).error(
                    function () {
                        self.markerIcon = '';
                        deferred.resolve(self.markerIcon);
                    }
                );
        }

        return deferred.promise;
    };

    this.getPOIIcon = function (poi) {
        var pictogramUrl = poi.properties.type.pictogram;

        return L.icon({
            iconUrl: pictogramUrl,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });
    };

    this.getClusterIcon = function (cluster) {
        return new L.DivIcon({
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            className: 'trek-cluster',
            html: '<span class="count">' + cluster.getChildCount() + '</span>'
        });
    };

    this.getDepartureIcon = function () {
        return map_icons.departure_icon;
    };

    this.getArrivalIcon = function () {
        return map_icons.arrival_icon;
    };

    this.getParkingIcon = function () {
        return map_icons.parking_icon;
    };

    this.getInformationIcon = function () {
        return map_icons.information_icon;
    };

    this.getIcon = function (category) {

        var deferred = $q.defer(),
            markerIcon,
            categoryIcon;

        $q.all([
            self.getMarkerIcon()
                .then(
                    function (icon) {
                        markerIcon = icon;
                    }
                ),
            self.getCategoryIcon(category.id)
                .then(
                    function (icon) {
                        categoryIcon = icon;
                    }
                )
        ]).then(
            function () {
                var markup = '';
                markup += '<div class="marker-icon">' + markerIcon + '</div>';
                markup += '<div class="cat-icon">' + categoryIcon + '</div>';

                var newIcon = new L.divIcon({
                    html: markup,
                    iconSize: [40, 56],
                    iconAnchor: [20, 56],
                    labelAnchor: [20, 20],
                    className: category.name
                });
                deferred.resolve(newIcon);
            }
        );

        return deferred.promise;

    };


}

module.exports = {
    mapService: mapService,
    iconsService: iconsService
};