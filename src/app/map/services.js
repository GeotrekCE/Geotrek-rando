'use strict';

function mapService($q, $state, utilsFactory, globalSettings, treksService, poisService, iconsService) {

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
                    elementLocation,
                    currentCount = counter,
                    type = '';

                if (result.geometry.type !== "Point" && !self.treksIconified) {
                    currentLayer = self._treksgeoJsonLayer;
                    type = 'geojson';
                    elementLocation = [];
                } else {
                    currentLayer = self._touristicsMarkersLayer;
                    type = 'category';
                    elementLocation = utilsFactory.getStartPoint(result);
                }

                self.createLayerFromElement(result, type, elementLocation)
                    .then(
                        function (layer) {
                            var selector = '#result-' + result.category.name + '-' + result.id.toString();
                            layer.on({
                                mouseover: function () {
                                    var listeEquivalent = document.querySelector(selector);
                                    if (listeEquivalent !== null) {
                                        if (!listeEquivalent.classList.contains('hovered')) {
                                            listeEquivalent.classList.add('hovered');
                                        }
                                    }
                                },
                                mouseout: function () {
                                    var listeEquivalent = document.querySelector(selector);
                                    if (listeEquivalent !== null) {
                                        if (listeEquivalent.classList.contains('hovered')) {
                                            listeEquivalent.classList.remove('hovered');
                                        }
                                    }
                                },
                                remove: function () {
                                    var listeEquivalent = document.querySelector(selector);
                                    if (listeEquivalent !== null) {
                                        if (listeEquivalent.classList.contains('hovered')) {
                                            listeEquivalent.classList.remove('hovered');
                                        }
                                    }
                                },
                                click: function () {
                                    $state.go("layout.detail", { slug: result.properties.slug });
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
            elementLocation,
            currentLayer;

        if (!self.loadingMarkers) {

            self.loadingMarkers = true;

            this.clearAllLayers();

            if (result.geometry.type !== "Point") {
                currentLayer = self._treksgeoJsonLayer;
                type = 'geojson';
                elementLocation = [];
            } else {
                currentLayer = self._touristicsMarkersLayer;
                type = 'category';
                elementLocation = utilsFactory.getStartPoint(result);
            }

            self.createLayerFromElement(result, type, elementLocation)
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

            self.createPOISFromElement(result);
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

        this._poisMarkersLayer = self.createLayer();

        this.map.addLayer(this._clustersLayer);
        this.map.addLayer(this._poisMarkersLayer);

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

    this.createPOISFromElement = function (element) {

        var startPoint = utilsFactory.getStartPoint(element);

        if (element.properties.parkin_elementLocation) {
            var parkingPoint = utilsFactory.getParkingPoint(element);
            self.createLayerFromElement(element, 'parking', parkingPoint)
                .then(
                    function (marker) {
                        self._poisMarkersLayer.addLayer(marker);
                    }
                );
        }

        if (element.geometry.type === 'LineString') {
            var endPoint = utilsFactory.getEndPoint(element);

            self.createLayerFromElement(element, 'departure', startPoint)
                .then(
                    function (marker) {
                        self._poisMarkersLayer.addLayer(marker);
                    }
                );

            self.createLayerFromElement(element, 'arrival', endPoint)
                .then(
                    function (marker) {
                        self._poisMarkersLayer.addLayer(marker);
                    }
                );
            

            poisService.getPoisFromElement(element.id)
                .then(
                    function (pois) {
                        _.forEach(pois.features, function (poi) {
                            var poiLocation = utilsFactory.getStartPoint(poi);
                            self.createLayerFromElement(poi, 'poi', poiLocation)
                                .then(
                                    function (marker) {
                                        var selector = '#poi-' + poi.id.toString();
                                        marker.on({
                                            mouseover: function () {
                                                var listeEquivalent = document.querySelector(selector);
                                                if (listeEquivalent !== null) {
                                                    if (!listeEquivalent.classList.contains('hovered')) {
                                                        listeEquivalent.classList.add('hovered');
                                                    }
                                                }
                                            },
                                            mouseout: function () {
                                                var listeEquivalent = document.querySelector(selector);
                                                if (listeEquivalent !== null) {
                                                    if (listeEquivalent.classList.contains('hovered')) {
                                                        listeEquivalent.classList.remove('hovered');
                                                    }
                                                }
                                            },
                                            remove: function () {
                                                var listeEquivalent = document.querySelector(selector);
                                                if (listeEquivalent !== null) {
                                                    if (listeEquivalent.classList.contains('hovered')) {
                                                        listeEquivalent.classList.remove('hovered');
                                                    }
                                                }
                                            },
                                            click: function () {
                                                //$state.go("layout.detail", { slug: result.properties.slug });
                                            }
                                        });
                                        self._poisMarkersLayer.addLayer(marker);
                                    }
                                );
                        });
                    }
                );
        }
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

    this.createLayerFromElement = function (element, type, elementLocation) {
        var deferred = $q.defer();

        if (type === "geojson") {
            var geoStyle = {
                className:  'layer-' + element.category.name + '-' + element.id + ' ' + element.category.name
            };

            if (element.geometry.type === 'Polygon') {
                geoStyle.className += ' fill';
            }

            deferred.resolve(L.geoJson(element, {
                style: geoStyle
            }));
        } else {
            var promise,
                param;

            switch (type) {
            case 'category':
                promise = iconsService.getElementIcon;
                param = element;
                break;

            case 'poi':
                promise = iconsService.getPOIIcon;
                param = element;
                break;

            default:
                promise = iconsService.getIcon;
                param = type;
                break;
            }

            promise(param)
                .then(
                    function (currentIcon) {

                        var marker = L.marker(
                            [elementLocation.lat, elementLocation.lng],
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

function iconsService($http, $q, categoriesService, poisService, utilsFactory) {

    var self = this;

    this.icons_liste = {
        default_icon: {},
        departure: {
            iconUrl: '/images/map/flag.svg',
            iconSize: [46, 52],
            iconAnchor: [13, 52],
            className: 'departure-marker'
        },
        arrival: {
            iconUrl: '/images/map/flag.svg',
            iconSize: [46, 52],
            iconAnchor: [13, 52],
            className: 'arrival-marker'
        },
        parking: {
            iconUrl: '/images/map/parking.svg',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
            labelAnchor: [10, 10],
            className: 'parking-marker'
        },
        information: {
            iconUrl: '/images/map/info.svg',
            iconSize: [],
            iconAnchor: [],
            labelAnchor: [],
            className: ''
        },
        poi: {
            iconUrl: '/images/map/poi.svg',
            iconSize: [],
            iconAnchor: [],
            labelAnchor: [],
            className: ''
        },
        category_base: {
            iconUrl: '/images/map/category_base.svg',
            iconSize: [40, 56],
            iconAnchor: [20, 56],
            labelAnchor: [20, 20]
        },
        poi_base: {
            iconUrl: '/images/map/category_base.svg',
            iconSize: [40, 56],
            iconAnchor: [20, 56],
            labelAnchor: [20, 20]
        }
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

    this.getPoiTypesIcons = function () {
        var deferred = $q.defer();

        if (self.poisTypesIcons) {
            deferred.resolve(self.poisTypesIcons);
        } else {

            poisService.getPois()
                .then(
                    function (pois) {
                        var counter = 0;
                        _.forEach(pois.features, function (poi) {
                            if (!self.poisTypesIcons) {
                                self.poisTypesIcons = {};
                            }
                            counter++;
                            var currentCounter = counter;
                            if (!utilsFactory.isSVG(poi.properties.type.pictogram)) {
                                self.poisTypesIcons[poi.properties.type.id] = {
                                    markup: poi.properties.type.pictogram,
                                    isSVG: false
                                };
                                if (currentCounter === _.size(pois)) {
                                    deferred.resolve(self.poisTypesIcons);
                                }
                            } else {
                                $http.get(poi.properties.type.pictogram)
                                    .success(
                                        function (icon) {
                                            self.poisTypesIcons[poi.properties.type.id] = {
                                                markup: icon.toString(),
                                                isSVG: true
                                            };
                                            if (currentCounter === _.size(pois)) {
                                                deferred.resolve(self.poisTypesIcons);
                                            }
                                        }
                                    ).error(
                                        function () {
                                            self.poisTypesIcons[poi.properties.type.id] = {
                                                markup: '',
                                                isSVG: true
                                            };
                                            if (currentCounter === _.size(pois)) {
                                                deferred.resolve(self.poisTypesIcons);
                                            }
                                        }
                                    );
                            }
                        });
                    }
                );
        }

        return deferred.promise;
    };

    this.getAPoiTypeIcon = function (poiTypeId) {
        var deferred = $q.defer();
        if (self.poisTypesIcons) {
            deferred.resolve(self.poisTypesIcons[poiTypeId]);
        } else {
            self.getPoiTypesIcons()
                .then(
                    function (icons) {
                        deferred.resolve(icons[poiTypeId]);
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
            self.getSVGIcon(self.icons_liste.category_base.iconUrl)
                .then(
                    function (iconMarkup) {
                        self.markerIcon = iconMarkup;
                        deferred.resolve(iconMarkup);
                    }
                );
        }

        return deferred.promise;
    };

    this.getSVGIcon = function (url, iconName) {
        var deferred = $q.defer();

        if (self.icons_liste[iconName].markup) {
            deferred.resolve(self.icons_liste[iconName].markup);
        } else {
            $http.get(url)
                .success(
                    function (icon) {
                        self.icons_liste[iconName].markup = icon.toString();
                        deferred.resolve(icon.toString());
                    }
                ).error(
                    function () {
                        self.icons_liste[iconName].markup = '';
                        deferred.resolve('');
                    }
                );
        }

        return deferred.promise;
    };

    this.getClusterIcon = function (cluster) {
        return new L.DivIcon({
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            className: 'trek-cluster',
            html: '<span class="count">' + cluster.getChildCount() + '</span>'
        });
    };

    this.getIcon = function (iconName) {
        var deferred = $q.defer();

        if (!iconName || !self.icons_liste[iconName]) {
            console.log('no icon');
            deferred.reject('icon doesn\'t exist');
        } else {
            if (self[iconName]) {
                deferred.resolve(self[iconName]);
            } else {
                if (!utilsFactory.isSVG(self.icons_liste[iconName].iconUrl)) {
                    self[iconName] = new L.divIcon({
                        html: self.icons_liste[iconName].iconUrl,
                        iconSize: self.icons_liste[iconName].iconSize,
                        iconAnchor: self.icons_liste[iconName].iconAnchor,
                        className: self.icons_liste[iconName].className
                    });
                    deferred.resolve(self[iconName]);
                } else {
                    self.getSVGIcon(self.icons_liste[iconName].iconUrl, iconName)
                        .then(
                            function (iconMarkup) {

                                self[iconName] = new L.divIcon({
                                    html: iconMarkup,
                                    iconSize: self.icons_liste[iconName].iconSize,
                                    iconAnchor: self.icons_liste[iconName].iconAnchor,
                                    className: self.icons_liste[iconName].className
                                });
                                deferred.resolve(self[iconName]);
                            }
                        );
                }
            }
        }

        return deferred.promise;
    };

    this.getPOIIcon = function (poi) {
        var deferred = $q.defer(),
            markerIcon,
            poiIcon;

        $q.all([
            self.getSVGIcon(self.icons_liste.poi_base.iconUrl, 'poi_base')
                .then(
                    function (icon) {
                        markerIcon = icon;
                    }
                ),
            self.getAPoiTypeIcon(poi.properties.type.id)
                .then(
                    function (icon) {
                        if (icon.isSVG) {
                            poiIcon = icon.markup;
                        } else {
                            poiIcon = '<img src="' + icon.markup + '" alt=""';
                        }
                    }
                )
        ]).then(
            function () {
                var markup = '';
                markup += '<div class="marker">' + markerIcon + '</div>';
                markup += '<div class="icon">' + poiIcon + '</div>';
                var newIcon = new L.divIcon({
                    html: markup,
                    iconSize: self.icons_liste.poi_base.iconSize,
                    iconAnchor: self.icons_liste.poi_base.iconAnchor,
                    labelAnchor: self.icons_liste.poi_base.labelAnchor,
                    className: 'double-marker poi layer-' + poi.properties.type.id + '-' + poi.id + ' ' + poi.properties.type.id
                });
                deferred.resolve(newIcon);
            }
        );

        return deferred.promise;

    };

    this.getElementIcon = function (element) {

        var deferred = $q.defer(),
            markerIcon,
            categoryIcon;

        $q.all([
            self.getSVGIcon(self.icons_liste.category_base.iconUrl, 'category_base')
                .then(
                    function (icon) {
                        markerIcon = icon;
                    }
                ),
            self.getCategoryIcon(element.category.id)
                .then(
                    function (icon) {
                        categoryIcon = icon;
                    }
                )
        ]).then(
            function () {
                var markup = '';
                markup += '<div class="marker">' + markerIcon + '</div>';
                markup += '<div class="icon">' + categoryIcon + '</div>';

                var newIcon = new L.divIcon({
                    html: markup,
                    iconSize: self.icons_liste.category_base.iconSize,
                    iconAnchor: self.icons_liste.category_base.iconAnchor,
                    labelAnchor: self.icons_liste.category_base.labelAnchor,
                    className: 'double-marker layer-' + element.category.name + '-' + element.id + ' ' + element.category.name
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