'use strict';

function mapService($q, settingsFactory, treksService, iconsService) {

    var self = this;

    this.initMap = function (mapSelector) {

        // Set background Layers
        this._baseLayers = {
            main: L.tileLayer(
                settingsFactory.MAIN_LEAFLET_BACKGROUND.LAYER_URL,
                {
                    id: 'main',
                    attribution: settingsFactory.MAIN_LEAFLET_BACKGROUND.ATTRIBUTION
                }
            ),
            satellite: L.tileLayer(
                settingsFactory.SATELLITE_LEAFLET_BACKGROUND.LAYER_URL,
                {
                    id: 'satellite',
                    attribution: settingsFactory.SATELLITE_LEAFLET_BACKGROUND.ATTRIBUTION
                }
            )
        };

        var mapParameters = {
            center: [settingsFactory.LEAFLET_CONF.CENTER_LATITUDE, settingsFactory.LEAFLET_CONF.CENTER_LONGITUDE],
            zoom: settingsFactory.LEAFLET_CONF.DEFAULT_ZOOM,
            minZoom: settingsFactory.LEAFLET_CONF.DEFAULT_MIN_ZOOM,
            maxZoom: settingsFactory.LEAFLET_CONF.DEFAULT_MAX_ZOOM,
            scrollWheelZoom: true,
            layers: this._baseLayers.main
        };

        //Mixins for map
        this.initCustomsMixins();

        this._map = L.map(mapSelector, mapParameters);

        // Set-up maps controls (needs _map to be defined);
        this.initMapControls();

        this.createTreksLayer();

        return map;
    };

    this.createTreksLayer = function () {

        this._treksLayer = new L.MarkerClusterGroup({
            showCoverageOnHover: false,
            iconCreateFunction: function(cluster) {
                return iconsService.getClusterIcon(cluster);
            }
        });

    };

    // Add treks geojson to the map
    this.displayTreks = function (trekCollection) {
        // Remove all markers so the displayed markers can fit the search results
        this._treksLayer.clearLayers();

        //$scope.mapService = mapService;
        angular.forEach(trekCollection, function(trek) {
            var trekDeparture = self.createClusterMarkerFromTrek(trek);
            trekDeparture.on({
                click: function(e) {
                    console.log('marker Clicked');
                    //$state.go("home.map.detail", { trekId: trek.id });
                }
            });
            self._treksLayer.addLayer(trekDeparture);
        });
        this._map.addLayer(this._treksLayer);

        /*if ((updateBounds == undefined) || (updateBounds == true)) {    
            this._map.fitBounds(this._treksLayer.getBounds());
        }*/
    };

    // MARKERS AND CLUSTERS  //////////////////////////////
    //
    //
    var _markers = [];

    this.getMarkers = function () {
        return _markers;
    };

    this.setMarkers = function (markers) {
        _markers = markers;
    };

    this.createMarkersFromTrek = function (trek, pois) {
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
        angular.forEach(trek.properties.information_desks, function (information) {
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

        angular.forEach(pois, function (poi) {
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

    this.createClusterMarkerFromTrek = function (trek) {
        var startPoint = treksService.getStartPoint(trek);

        var marker = L.marker([startPoint.lat, startPoint.lng], {
            icon: iconsService.getTrekIcon()
        });

        return marker;
    };


    // UI CONTROLS //////////////////////////////
    //
    //

    this.initMapControls = function () {
        this.setScale();
        this.setAttribution();
        this.setZoomControlPosition();
        this.setFullScreenControll();
        this.createSatelliteView();
    }

    this.setScale = function () {
        L.control.scale({imperial: false}).addTo(this._map);
    };

    this.setZoomControlPosition = function () {
        this._map.zoomControl.setPosition('topright');
    };

    this.setFullScreenControll = function () {
        L.control.fullscreen({
            position: 'topright',
            title: 'Fullscreen'
        }).addTo(this._map);
    };

    this.setAttribution = function () {
        this._map.attributionControl.setPrefix(settingsFactory.LEAFLET_CONF.ATTRIBUTION);
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
    }

    this.createSatelliteView = function () {
        L.Control.SwitchBackgroundLayers = L.Control.extend({
            options: {
                position: 'bottomleft',
            },

            onAdd: function (map) {

                this.map = map;

                this.switch_detail_zoom = $(map._container).data('switch-detail-zoom');
                if (this.switch_detail_zoom > 0) {
                    map.on('zoomend', function (e) {
                        if (map.isShowingLayer('satellite'))
                            return;
                        if (e.target.getZoom() > this.switch_detail_zoom) {
                            if (!map.isShowingLayer('detail'))
                                setTimeout(function () { map.switchLayer('detail'); }, 100);
                        }
                        else {
                            if (!map.isShowingLayer('main'))
                                setTimeout(function () { map.switchLayer('main'); }, 100);
                        }
                    }, this);
                }

                this._container = L.DomUtil.create('div', 'simple-layer-switcher');

                var className = 'toggle-layer background satellite';

                this.button = L.DomUtil.create('a', className, this._container);
                this.button.setAttribute('title', 'Show satellite');
                $(this.button).tooltip({placement: 'right',
                                        container: map._container});

                L.DomEvent.disableClickPropagation(this.button);
                L.DomEvent.on(this.button, 'click', function (e) {
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
                }
                else {
                    this.map.switchLayer(this.map.getZoom() > this.switch_detail_zoom ?
                                         'detail' : 'main');

                    L.DomUtil.removeClass(this.button, 'main');
                    L.DomUtil.addClass(this.button, 'satellite');
                    this.button.setAttribute('title', 'Show satellite');
                }

                $(this.button).tooltip('destroy');
                $(this.button).tooltip({placement: 'right',
                                        container: this.map._container});
            }

        });

        var switchControl = new L.Control.SwitchBackgroundLayers();
            switchControl.addTo(this._map);
    };


    // CUSTOM MIXINS //////////////////////////////
    //
    //
    this.initCustomsMixins = function () {
        this.addMapLayersMixin();
        this.topPadding();
        this.addFakeBoundsMixin();
        //this.togglePoiLayer();
    }

    this.addMapLayersMixin = function () {
        var LayerSwitcherMixin = {

            isShowingLayer: function (name) {
                if (this.hasLayer(self._baseLayers[name])) {
                    return true;
                } else {
                    return false;
                }
            },

            switchLayer: function (destLayer) {
                for (var base in self._baseLayers) { 
                    if (this.hasLayer(self._baseLayers[base]) && self._baseLayers[base] != self._baseLayers[destLayer]) { 
                        this.removeLayer(self._baseLayers[base]); 
                    }
                }
                this.addLayer(self._baseLayers[destLayer]);
            }
        };

        L.Map.include(LayerSwitcherMixin);
    }

    this.topPadding = function () {
        L.LatLngBounds.prototype.padTop = function (bufferRatio) {
            var sw = this._southWest,
                ne = this._northEast,
                heightBuffer = Math.abs(sw.lat - ne.lat) * bufferRatio;

            return new L.LatLngBounds(
                    new L.LatLng(sw.lat, sw.lng),
                    new L.LatLng(ne.lat + heightBuffer, ne.lng));

        };
    };

    this.addFakeBoundsMixin = function () {
        var FakeBoundsMapMixin = {
            __fakeBounds: function (bounds) {
                /* Depending on sidebar open/close, we correct the bounds of the map
                If init, we increase, else we reduce.
                */
                if (!this._loaded)
                    return bounds;

                var mapBounds = this.getBounds(),
                    from = arguments.length === 0;
                bounds = from ? mapBounds : bounds;

                var closed = $('#side-bar').hasClass('closed');
                if (closed) {
                    return bounds;
                }

                var sidebarW = $('#side-bar').outerWidth() / $('#mainmap').width(),
                    boundswidth = mapBounds.getSouthEast().lng - mapBounds.getSouthWest().lng,
                    offset = sidebarW * boundswidth * (from ? 1 : -1);

                var oldSouthWest = bounds.getSouthWest(),
                    southWest = L.latLng(oldSouthWest.lat, oldSouthWest.lng + offset);
                return L.latLngBounds(southWest, bounds.getNorthEast());
            },

            fitFakeBounds: function (bounds) {
                this.fitBounds(bounds);
                this.whenReady(function () {
                    this.fitBounds(this.__fakeBounds(bounds));
                }, this);
            },

            getFakeBounds: function () {
                return this.__fakeBounds();
            },

            fakePanTo: function (latlng) {
                var bounds = new L.LatLngBounds([latlng, latlng]),
                    fakeBounds = this.__fakeBounds(bounds);
                this.panTo(fakeBounds.getCenter());
            },

            panToOffset: function (latlng, offset, options) {
                var x = this.latLngToContainerPoint(latlng).x - offset[0];
                var y = this.latLngToContainerPoint(latlng).y - offset[1];
                var point = this.containerPointToLatLng([x, y]);

                var current = this.latLngToContainerPoint(this.getCenter());

                if (L.point(x, y).distanceTo(current) < options.minimumDistance)
                    return;

                return this.setView(point, this._zoom, { pan: options })
            }
        };

        L.Map.include(FakeBoundsMapMixin);
    }

    this.togglePoiLayer = function () {
        L.Control.TogglePOILayer = L.Control.extend({
        options: {
            position: 'bottomleft',
        },

        initialize: function (layer, options) {
            this.layer = layer;
            L.Control.prototype.initialize.call(this, options);
        },

        onAdd: function(map) {
            this.map = map;

            this._container = L.DomUtil.create('div', 'simple-layer-switcher pois');
            var className = 'toggle-layer pois active';
            this.button = L.DomUtil.create('a', className, this._container);
            this.button.setAttribute('title', gettext('Points of interest'));
            $(this.button).tooltip({placement: 'right'});

            L.DomEvent.disableClickPropagation(this.button);
            L.DomEvent.on(this.button, 'click', function (e) {
                this.toggleLayer();
            }, this);

            return this._container;
        },

        toggleLayer: function () {
            if (this.layer) {
                if (this.map.hasLayer(this.layer)) {
                    $(window).trigger('pois:hidden');
                    L.DomUtil.removeClass(this.button, 'active');
                    this.map.removeLayer(this.layer);
                }
                else {
                    $(window).trigger('pois:shown');
                    L.DomUtil.addClass(this.button, 'active');
                    this.map.addLayer(this.layer);
                }
            }
        }

    });
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

    this.getPOIIcon = function (poi) {
        var pictogramUrl = poi.properties.type.pictogram;

        return L.icon({
            iconUrl: pictogramUrl,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        })
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
        return trek_icons.departure_icon;
    };

    this.getArrivalIcon = function () {
        return trek_icons.arrival_icon;
    };

    this.getParkingIcon = function () {
        return trek_icons.parking_icon;
    };

    this.getInformationIcon = function () {
        return trek_icons.information_icon;
    };

    this.getTrekIcon = function () {
        return trek_icons.trek_icon;
    };


}

module.exports = {
    mapService: mapService,
    iconsService: iconsService
};