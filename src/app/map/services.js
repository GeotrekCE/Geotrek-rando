'use strict';

function mapService($q, $state, $resource, $filter, utilsFactory, globalSettings, translationService, settingsFactory, treksService, poisService, servicesService, iconsService, popupService, layersService, boundsLimitService) {

    var self = this;

    this.loadingMarkers = false;

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

    this.addGeoServices = function (element) {
        var deferred = $q.defer();

        var controlServices = L.control.servicesToggle(self._servicesMarkersLayer);
        controlServices.addTo(this.map);
        var classServices = controlServices.getContainer().classList;

        if (element.properties.contentType === 'trek') {
            servicesService.getServicesFromElement(element.id)
                .then(
                    function (services) {
                        var counter = 0;
                        _.forEach(services.features, function (service) {
                            var poiLocation = utilsFactory.getStartPoint(service);
                            self.createLayerFromElement(service, 'service', poiLocation)
                                .then(
                                    function (marker) {
                                        counter++;

                                        popupService.attachPopups(marker);

                                        self._servicesMarkersLayer.addLayer(marker);

                                        if (counter === services.features.length) {
                                            if (classServices.contains('hidden')) {
                                                classServices.remove('hidden');
                                            }
                                            deferred.resolve();
                                        }
                                    }
                                );
                        });
                        if (services.features.length === 0 && !classServices.contains('hidden')) {
                            classServices.add('hidden');
                            deferred.resolve();
                        }
                    }
                );

        } else {
            if (!classServices.contains('hidden')) {
                classServices.add('hidden');
                deferred.resolve();
            }
        }

        return deferred.promise;
    };

    this.createPOISFromElement = function (element) {
        var deferred = $q.defer(),
            promises = [],
            startPoint = utilsFactory.getStartPoint(element);

        if (element.properties.parking_location) {
            var parkingPoint = utilsFactory.getParkingPoint(element);
            promises.push(
                self.createLayerFromElement(element, 'parking', parkingPoint)
                    .then(
                        function (marker) {
                            marker.popupSources.hint = element.properties.advised_parking;

                            popupService.attachPopups(marker);

                            self._infosMarkersLayer.addLayer(marker);
                        }
                    )
            );
        }

        if (element.geometry.type === 'LineString' || element.geometry.type === 'MultiLineString') {
            var endPoint = utilsFactory.getEndPoint(element);
            if (startPoint.lat === endPoint.lat && startPoint.lng === endPoint.lng) {
                promises.push(
                    self.createLayerFromElement(element, 'departureArrival', startPoint)
                        .then(
                            function (marker) {
                                _.merge(marker.popupSources, {
                                    hint: element.properties.departure + '\n' + element.properties.arrival
                                });
                                popupService.attachPopups(marker);
                                self._infosMarkersLayer.addLayer(marker);
                            }
                        )
                );
            } else {
                promises.push(
                    self.createLayerFromElement(element, 'departure', startPoint)
                        .then(
                            function (marker) {
                                _.merge(marker.popupSources, {
                                    hint: element.properties.departure
                                });
                                popupService.attachPopups(marker);
                                self._infosMarkersLayer.addLayer(marker);
                            }
                        )
                );

                promises.push(
                    self.createLayerFromElement(element, 'arrival', endPoint)
                        .then(
                            function (marker) {
                                _.merge(marker.popupSources, {
                                    hint: element.properties.arrival
                                });
                                popupService.attachPopups(marker);
                                self._infosMarkersLayer.addLayer(marker);
                            }
                        )
                );
            }

            if (element.properties.points_reference) {
                var i = 0,
                    tempRefPoint;
                for (i = 0; i < element.properties.points_reference.coordinates.length; i++) {
                    tempRefPoint = {
                        order: i + 1,
                        coordinates: {
                            'lat': element.properties.points_reference.coordinates[i][1],
                            'lng': element.properties.points_reference.coordinates[i][0]
                        }
                    };
                    promises.push(
                        self.createLayerFromElement(tempRefPoint, 'ref-point', tempRefPoint.coordinates)
                            .then(
                                function (marker) {
                                    self._infosMarkersLayer.addLayer(marker);
                                }
                            )
                    );
                }
            }

            promises.push(
                poisService.getPoisFromElement(element.id, true)
                    .then(
                        function (pois) {
                            var counter = 0;
                            _.forEach(pois.features, function (poi) {
                                var poiLocation = utilsFactory.getStartPoint(poi);
                                self.createLayerFromElement(poi, 'poi', poiLocation)
                                    .then(
                                        function (marker) {
                                            var selector = '#poi-' + poi.id.toString();

                                            counter++;

                                            _.merge(marker.popupSources, {
                                                selector: selector,
                                                scroll: {
                                                    event: 'mouseover',
                                                    container: '.detail-aside-group-content',
                                                    target: selector
                                                }
                                            });

                                            popupService.attachPopups(marker);

                                            self._poisMarkersLayer.addLayer(marker);
                                        }
                                    );
                            });
                        }
                    )
            );

        }

        promises.push(this.addGeoServices(element));

        $q.all(promises)
            .then(
                function () {
                    deferred.resolve(true);
                }
            );

        return deferred.promise;
    };

    this.createElementsMarkers = function (elements, type) {
        // console.log(type);
        var startPoint = [];
        elements.forEach(function (element) {
            startPoint = utilsFactory.getStartPoint(element);

            if(type === 'near') {
                self.createLayerFromElement(element, 'near', startPoint)
                    .then(
                        function (marker) {

                            marker.options.icon.options.className += ' ' + type + '-marker';

                            _.merge(marker.popupSources, {
                                selector: '#result-category-' + element.properties.category.id + '-' + element.id
                            });

                            popupService.attachPopups(marker);

                            self._nearMarkersLayer.addLayer(marker);
                        }
                    );
            }
            if (type === 'children') {
                self.createLayerFromElement(element, 'children', startPoint)
                    .then(
                        function (marker) {

                            marker.options.icon.options.className += ' ' + type + '-marker';

                            _.merge(marker.popupSources, {
                                selector: '#result-category-' + element.properties.category.id + '-' + element.id
                            });

                            popupService.attachPopups(marker);
                            self._childMarkersLayer.addLayer(marker);
                        }
                    );
            }
        });
    };

    this.createLayerFromElement = function (element, type, elementLocation) {
        var deferred = $q.defer();
        var popupSources = {};
        if (type === "geojson" && element.geometry.type !== 'MultiPoint') {
            var geoStyle = {
                className:  'layer-category-' + element.properties.category.id + '-' + element.id + ' category-' + element.properties.category.id
            };

            if (element.geometry.type === 'Polygon') {
                geoStyle.className += ' fill';
            }
            var geoJsonLayer = L.geoJson(element, {
                style: geoStyle
            });
            geoJsonLayer.options.result = element;
            deferred.resolve(geoJsonLayer);
        } else {
            var promise,
                param;

            switch (type) {
            case 'geojson':
                promise = iconsService.getElementIcon;
                param = element;
                break;

            case 'category':
                promise = iconsService.getElementIcon;
                param = element;
                popupSources.hint = element.properties.name;
                break;

            case 'near':
                promise = iconsService.getElementIcon;
                param = element;
                popupSources.hint = element.properties.name;
                break;

            case 'children':
                promise = iconsService.getElementIcon;
                param = element;
                popupSources.hint = element.properties.name;
                break;

            case 'poi':
                promise = iconsService.getPOIIcon;
                param = element;
                popupSources.hint = 'selector';
                popupSources.info = 'none';
                break;

            case 'service':
                promise = iconsService.getServiceIcon;
                param = element;
                popupSources.hint = element.properties.type.name;
                break;

            case 'ref-point':
                promise = iconsService.getRefIcon;
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
                        if (elementLocation) {
                            var marker = L.marker(
                                [elementLocation.lat, elementLocation.lng],
                                {
                                    icon: currentIcon
                                }
                            );
                            marker.options.result = element;
                            marker.popupSources = popupSources;
                            deferred.resolve(marker);
                        } else {
                            deferred.reject('no position provided');
                        }
                    }
                );
        }

        return deferred.promise;
    };


    // UI CONTROLS //////////////////////////////
    //
    //

    this.initMapControls = function () {
        this.setViewPortFilteringControl();
        this.setAttribution();
        this.setZoomControlPosition();
        this.setFullScreenControl();
        this.setMinimap();
        this.setScale();
        // this.createServicesToggleControl();
        this.createResetViewButton();
        this.createLayerSwitch();

        return this;
    };

    this.setScale = function () {
        L.control.scale({imperial: false, position: 'bottomright'}).addTo(this.map);
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

    /**
     * Create and attach the map control button allowing to reset pan/zoom to the main loaded content
     * @return {Oject} Map object
     */
    this.createResetViewButton = function () {
        function getLayersToFit () {
            var layers = [self._clustersLayer];
            if (self._treksgeoJsonLayer) {
                layers.push(self._treksgeoJsonLayer);
            }
            return layers;
        }

        function resetViewButtonClick () {
            return self.updateBounds(getLayersToFit());
        }

        function resetViewButtonOnAdd () {
            var container = L.DomUtil.create('div', 'leaflet-control-resetview leaflet-bar');
            var button    = L.DomUtil.create('a',   'leaflet-control-resetview-button', container);
            button.title  = 'Reset view';

            L.DomEvent.disableClickPropagation(button);
            L.DomEvent.on(button, 'click', resetViewButtonClick, self);

            return container;
        }

        L.Control.Resetview = L.Control.extend({
            options: {
                position: 'topright'
            },
            onAdd: resetViewButtonOnAdd
        });

        return this.map.addControl(new L.Control.Resetview());
    };

    // this.createServicesToggleControl = function () {
    //
    //     L.Control.ServicesToggle = L.Control.extend({
    //         options: {
    //             position: 'bottomleft',
    //         },
    //
    //         onAdd: function (map) {
    //
    //             this.map = map;
    //
    //             this._container = L.DomUtil.create('div', 'simple-services-toggle');
    //
    //             var className = 'toggle-layer services active';
    //
    //             this.button = L.DomUtil.create('a', className, this._container);
    //             this.button.title = 'Toggle Services';
    //
    //             L.DomEvent.disableClickPropagation(this.button);
    //             L.DomEvent.on(this.button, 'click', function () {
    //                 this.toggleLayer();
    //             }, this);
    //
    //             return this._container;
    //         },
    //
    //         toggleLayer: function () {
    //
    //             if (this.map.hasLayer(self._servicesMarkersLayer)) {
    //                 this.map.removeLayer(self._servicesMarkersLayer);
    //                 this.button.classList.remove('active');
    //             } else {
    //                 this.map.addLayer(self._servicesMarkersLayer);
    //                 this.button.classList.add('active');
    //             }
    //         }
    //
    //     });
    //     // self.servicesControl = new L.Control.ServicesToggle();
    //     // self.servicesControl.addTo(this.map);
    //
    //     L.control.servicesToggle = function () {
    //        return new L.Control.ServicesToggle();
    //    };
    // };



    this.createLayerSwitch = function () {

        var permanentTileLayersName   = globalSettings.PERMANENT_TILELAYERS_NAME  || 'Default';
        var orthophotoTileLayersName  = globalSettings.ORTHOPHOTO_TILELAYERS_NAME || 'Satellite';
        var permanentTileLayersParam  = {};

        permanentTileLayersParam[permanentTileLayersName]  = this._baseLayers.main;
        permanentTileLayersParam[orthophotoTileLayersName] = this._baseLayers.satellite;

        var layersControl = L.control.switchBackgroundLayers(
            permanentTileLayersParam,
            { position: 'bottomleft' }
        );

        var optionalLayersControl = L.control.backgroundLayers(
            this._optionalLayers,
            { position: 'bottomleft' }
        );

        layersControl.addTo(this.map);
        optionalLayersControl.addTo(this.map);
        return true;
    };

    this.setViewPortFilteringControl = function () {
        L.Control.ViewportFilter = L.Control.extend({
            options: {
                position: 'bottomleft'
            },
            onAdd: function () {
                var controlContainer = L.DomUtil.create('div', 'leaflet-control-viewportfilter');
                var controlInput = L.DomUtil.create('input', 'leaflet-control-viewportfilter-button', controlContainer);
                controlInput.type = 'checkbox';
                controlInput.value = 'viewport-filtering';
                controlInput.checked = globalSettings.FILTER_BY_VIEWPORT_DEFAULT;
                var controlCaption = L.DomUtil.create('span', 'leaflet-control-viewportfilter-caption', controlContainer);
                controlCaption.innerHTML = $filter('translate')('FILTER_ON_MOVE_MAP');

                L.DomEvent.on(controlInput, 'change', function () {
                    self.filterByViewport = document.querySelector('.leaflet-control-viewportfilter-button').checked;
                    self.resultsVisibility();
                }, this);
                return controlContainer;
            }
        });

        this.ViewportFilterControl = new L.Control.ViewportFilter();
        this.map.addControl(this.ViewportFilterControl);
    };

    this.setMinimap = function () {
        if (globalSettings.ACTIVE_MINIMAP) {
            var miniMapOptions = {
                    toggleDisplay: true,
                    zoomLevelOffset: globalSettings.MINIMAP_OFFSET
                };

            this._miniMap = new L.Control.MiniMap(layersService.getMainLayersGroup(), miniMapOptions).addTo(this.map);
        }
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



    // MAIN FUNCTIONS AND INIT
    //
    //

    this.invalidateSize = function () {
        self.map.invalidateSize();
    };

    this.createLayer = function () {

        var layer = new L.LayerGroup();

        return layer;

    };

    this.createClusterLayer = function () {

        var clusterLayer = new L.MarkerClusterGroup({
            showCoverageOnHover: false,
            spiderfyDistanceMultiplier: 2,
            iconCreateFunction: function (cluster) {
                return iconsService.getClusterIcon(cluster);
            }
        });

        return clusterLayer;

    };

    this.createPOIsLayer = function () {

        var clusterLayer = new L.MarkerClusterGroup({
            showCoverageOnHover: false,
            disableClusteringAtZoom: globalSettings.LEAFLET_CONF.DEFAULT_MAX_ZOOM,
            iconCreateFunction: function (cluster) {
                return iconsService.getPOIClusterIcon(cluster);
            }
        });

        return clusterLayer;

    };

    this.createNearLayer = function () {

        var clusterLayer = new L.MarkerClusterGroup({
            showCoverageOnHover: false,
            disableClusteringAtZoom: globalSettings.LEAFLET_CONF.DEFAULT_MAX_ZOOM,
            iconCreateFunction: function (cluster) {
                return iconsService.getNearClusterIcon(cluster);
            }
        });

        return clusterLayer;

    };

    this.createChildLayer = function () {

        var clusterLayer = new L.MarkerClusterGroup({
            showCoverageOnHover: false,
            disableClusteringAtZoom: globalSettings.LEAFLET_CONF.DEFAULT_MAX_ZOOM,
            iconCreateFunction: function (cluster) {
                return iconsService.getChildClusterIcon(cluster);
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
        self._poisMarkersLayer.clearLayers();
        self._nearMarkersLayer.clearLayers();
        self._infosMarkersLayer.clearLayers();
        self._servicesMarkersLayer.clearLayers();

        if (globalSettings.ENABLE_TREKS) {
            self._treksMarkersLayer.clearLayers();
            self._treksgeoJsonLayer.clearLayers();
        }

        if (globalSettings.ENABLE_TOURISTIC_CONTENT || globalSettings.ENABLE_TOURISTIC_EVENTS) {
            self._touristicsMarkersLayer.clearLayers();
        }

    };

    /**
     * Fit bounds of self.map to object on <layers>
     * @param  {Array}  layers
     * @param  {Number} padding
     * @return {Object} Map object
     */
    this.updateBounds = function (layers, padding, fitBounds) {
        if (fitBounds === false) {
            return self.map;
        }

        if (!(layers instanceof Array)) {
            layers = [layers];
        }

        var bounds;

        layers.forEach(function (layer) {
            var currentBounds = layer.getBounds();
            if (bounds && bounds.extend) {
                bounds.extend(currentBounds);
            } else {
                bounds = currentBounds;
            }
        });

        var fitBoundsOptions = {
            padding: !isFinite(padding) ? 0 : Math.abs(padding),
            maxZoom: self.maxZoomFitting,
            animate: false
        };

        if (bounds.isValid()) {
            return self.map.fitBounds(bounds, fitBoundsOptions);
        } else {
            return self.map;
        }
    };

    this.centerOn = function (result) {
        var coords = utilsFactory.getStartPoint(result);
        self.setCenter(coords);
        return self.map;
    };

    this.setCenter = function (coords) {
        self.map.panTo(coords);
        return self.map;
    };


    this.highlightPath = function (element, permanent, detailView) {
        var hoverStyle = {
            className:  'layer-highlight'
        },
        geoElement = {};

        if (!self.treksIconified || detailView) {
            geoElement = L.geoJson(element, {
                style: hoverStyle
            });
            if (!permanent) {
                if (self.geoHover) {
                    self._infosMarkersLayer.removeLayer(self.geoHover);
                }

                self.geoHover = geoElement;
            }

            geoElement.addTo(self._infosMarkersLayer);
            geoElement.bringToBack();
        }

    };

    this.testMarkersVisibility = function (layer) {
        // Construct an empty list to fill with onscreen markers.
        var inBounds = [],
        // Get the map bounds - the top-left and bottom-right locations.
            bounds = self.map.getBounds();

        // For each layer, consider whether it is currently visible by comparing
        // with the current map bounds.
        layer.eachLayer(function (layer) {
            if (layer.options.result) {
                if (layer.options.result.geometry.type !== 'Point' && layer.options.result.geometry.type !== 'MultiPoint' && !self.treksIconified) {
                    if (layer.getBounds && bounds.intersects(layer.getBounds())) {
                        inBounds.push(layer.options.result);
                    }
                } else {
                    if (layer.getLatLng && bounds.contains(layer.getLatLng())) {
                        inBounds.push(layer.options.result);
                    }
                }
            }
        });

        return inBounds;
    };

    this.resultsVisibility = function () {
        var visibleMarkers = self.testMarkersVisibility(self._clustersLayer),
            visibleGeoJson = self.testMarkersVisibility(self._treksgeoJsonLayer);

        var visbleResults = _.union(visibleMarkers, visibleGeoJson);

        _.forEach(self.currentResults, function (currentResult) {
            var selector = '#result-category-' + currentResult.properties.category.id.toString() + '-' + currentResult.id.toString();
            var listResult = document.querySelector(selector);
            if (listResult) {
                if (!self.filterByViewport) {
                    if (listResult.classList.contains('not-in-viewport')) {
                        listResult.classList.remove('not-in-viewport');
                    }
                } else {
                    var isVisibe = false;

                    _.forEach(visbleResults, function (currentActiveResult) {
                        if (currentResult.properties.category.id.toString() === currentActiveResult.properties.category.id.toString() && currentResult.id.toString() === currentActiveResult.id.toString()) {
                            isVisibe = true;
                        }
                    });
                    if (isVisibe) {
                        if (listResult.classList.contains('not-in-viewport')) {
                            listResult.classList.remove('not-in-viewport');
                        }
                    } else {
                        if (!listResult.classList.contains('not-in-viewport')) {
                            listResult.classList.add('not-in-viewport');
                        }
                    }
                }
            }
        });

    };

    this.createElevation = function (result) {
        /*
         * Load altimetric profile from JSON
         */
        var currentLang = translationService.getCurrentLang();
        if (currentLang.code) {
            currentLang = currentLang.code;
        }
        var url = settingsFactory.trekUrl.replace(/\$lang/, currentLang) + result.id + '/' + globalSettings.PROFILE_FILE;
        var requests = $resource(url, {}, {
            query: {
                method: 'GET'
            }
        }, {stripTrailingSlashes: false});

        requests.query().$promise
            .then(function (data) {
                var primaryColor = 'rgba(200, 200, 200, 1)';
                var transparentizedColor = primaryColor.replace(/^(rgb)\((\d{1,3},\s*\d{1,3},\s*\d{1,3})\)$/gm, '$1a($2, 0.8)');

                function updateSparkline() {
                    jQuery('#elevation .detail-content-elevation-canvas').sparkline(data.profile,
                        L.Util.extend(
                            {
                                tooltipSuffix: ' m',
                                numberDigitGroupSep: '',
                                width: '100%',
                                height: 150
                            },
                            {
                                type: 'line',
                                chartRangeMin: data.limits.floor,
                                chartRangeMax: data.limits.ceil,
                                lineWidth: 3,
                                spotColor: 'transparent',
                                minSpotColor: 'transparent',
                                maxSpotColor: 'transparent',
                                fillColor: transparentizedColor,
                                lineColor: primaryColor,
                                highlightSpotColor: 'rgba(0, 0, 0, 0.5)',
                                highlightLineColor: primaryColor
                            }
                        ));
                }

                updateSparkline();

                self.currentElevationPoint = L.marker([0, 0], {
                    icon: L.divIcon({
                        iconSize: [16, 16],
                        iconAnchor: [8, 8],
                        className: 'elevationMarker'
                    })
                });
                self.currentElevationPoint.addTo(self.map);

                jQuery(window).on('resize', function () {
                    updateSparkline();
                });

                jQuery('#elevation').on('sparklineRegionChange', function (ev) {
                    var sparkline = ev.sparklines[0],
                        region = sparkline.getCurrentRegionFields();
                    var currentPoint = data.profile.filter(function testLength(element) {
                        if (element[0] === region.x ) {
                            return element;
                        }
                    });
                    self.currentElevationPoint.setLatLng([currentPoint[0][2][1], currentPoint[0][2][0]]);
                    //value = region.y;
                    var distance = (region.x < 10000) ? Math.round(region.x) + " m" : Math.round(region.x/100)/10 + " km";
                    jQuery('#mouseoverprofil').text(distance);
                    // Trigger global event
                    jQuery('#elevation').trigger('hover:distance', region.x);
                }).on('mouseover', function () {
                    jQuery('.elevationMarker').addClass('active');
                }).on('mouseleave', function () {
                    jQuery('.elevationMarker').removeClass('active');
                    jQuery('#mouseoverprofil').text('');
                    jQuery('#elevation').trigger('hover:distance', null);
                });
            });
    };

    // Add treks geojson to the map
    this.displayResults = function (results, fitBounds) {
        var deferred = $q.defer();
        var counter  = 0;

        this.maxZoomFitting = globalSettings.TREKS_TO_GEOJSON_ZOOM_LEVEL - 1;

        if (!self.loadingMarkers) {
            self.loadingMarkers = true;
            self.currentResults = results;

            this.treksIconified = this.map.getZoom() < globalSettings.TREKS_TO_GEOJSON_ZOOM_LEVEL;
            this.clearAllLayers();

            var promiseArray = [];

            _.forEach(results, function (result) {
                counter++;

                var currentLayer,
                    elementLocation,
                    currentCount = counter,
                    type = '';

                if (result.geometry.type !== "Point" && result.geometry.type !== 'MultiPoint' && !self.treksIconified) {
                    promiseArray.push(
                        self.createLayerFromElement(result, 'geojson', [])
                            .then(
                                function (layer) {
                                    var selector = '#result-category-' + result.properties.category.id + '-' + result.id;
                                    var itself = '.layer-category-' + result.properties.category.id + '-' + result.id;

                                    if (globalSettings.ALWAYS_HIGHLIGHT_TREKS) {
                                        self.highlightPath(result, true);
                                    }

                                    layer.on({
                                        mouseover: function () {
                                            var listeEquivalent = document.querySelector(selector);
                                            var markerEquivalent = document.querySelectorAll(itself);
                                            if (listeEquivalent && !listeEquivalent.classList.contains('hovered')) {
                                                listeEquivalent.classList.add('hovered');
                                            }
                                            _.each(markerEquivalent, function (currentMarker) {
                                                if (currentMarker && !currentMarker.classList.contains('hovered')) {
                                                    currentMarker.classList.add('hovered');
                                                }
                                            });

                                            self.highlightPath(result);
                                        },
                                        mouseout: function () {
                                            var listeEquivalent = document.querySelector(selector);
                                            var markerEquivalent = document.querySelectorAll(itself);
                                            if (listeEquivalent && listeEquivalent.classList.contains('hovered')) {
                                                listeEquivalent.classList.remove('hovered');
                                            }
                                            _.each(markerEquivalent, function (currentMarker) {
                                                if (currentMarker && currentMarker.classList.contains('hovered')) {
                                                    currentMarker.classList.remove('hovered');
                                                }
                                            });
                                            if (self.geoHover) {
                                                self._nearMarkersLayer.removeLayer(self.geoHover);
                                            }
                                        },
                                        remove: function () {
                                            var listeEquivalent = document.querySelector(selector);
                                            var markerEquivalent = document.querySelectorAll(itself);
                                            if (listeEquivalent && listeEquivalent.classList.contains('hovered')) {
                                                listeEquivalent.classList.remove('hovered');
                                            }
                                            _.each(markerEquivalent, function (currentMarker) {
                                                if (currentMarker && currentMarker.classList.contains('hovered')) {
                                                    currentMarker.classList.remove('hovered');
                                                }
                                            });

                                        },
                                        click: function () {
                                            $state.go("layout.detail", { catSlug: result.properties.category.slug, slug: result.properties.slug });
                                        }
                                    });
                                    jQuery(selector).on('mouseenter', function () {
                                        self.highlightPath(result);
                                    });
                                    jQuery(selector).on('mouseleave', function () {
                                        if (self.geoHover) {
                                            self._nearMarkersLayer.removeLayer(self.geoHover);
                                        }
                                    });
                                    self._treksgeoJsonLayer.addLayer(layer);
                                    self._clustersLayer.addLayer(self._treksgeoJsonLayer);
                                }
                            )
                    );
                }

                currentLayer = (result.properties.contentType === 'trek' ? self._treksMarkersLayer : self._touristicsMarkersLayer);
                type = 'category';
                elementLocation = utilsFactory.getStartPoint(result);

                promiseArray.push(
                    self.createLayerFromElement(result, type, elementLocation)
                        .then(
                            function (layer) {
                                var selector = '#result-category-' + result.properties.category.id.toString() + '-' + result.id.toString();

                                _.merge(layer.popupSources, {
                                    selector: '#result-category-' + result.uid
                                });

                                popupService.attachPopups(layer);

                                if (result.geometry.type !== "Point" && result.geometry.type !== "MultiPoint") {
                                    jQuery(selector).on('mouseenter', function () {
                                        self.highlightPath(result);
                                    });
                                    jQuery(selector).on('mouseleave', function () {
                                        if (self.geoHover) {
                                            self._nearMarkersLayer.removeLayer(self.geoHover);
                                        }
                                    });
                                }
                                currentLayer.addLayer(layer);
                                self._clustersLayer.addLayer(currentLayer);

                                if (currentCount === _.size(results)) {
                                    self.map.invalidateSize();

                                    if (fitBounds === true) {
                                        self.updateBounds([self._clustersLayer]);
                                    }

                                    self.resultsVisibility();
                                    self.map.on('moveend', self.resultsVisibility);
                                    self.loadingMarkers = false;
                                }
                            }
                        )
                );

            });

            $q.all(promiseArray).finally(function () {
                deferred.resolve(true);
            });

        } else {
            deferred.resolve(false);
        }

        return deferred.promise;
    };

    this.displayDetail = function (result, fitBounds) {

        var type = '',
            elementLocation,
            currentLayer;

        this.maxZoomFitting = globalSettings.DEFAULT_MAX_ZOOM;

        if (!self.loadingMarkers) {

            self.map.off('moveend', self.resultsVisibility);

            self.loadingMarkers = true;

            this.clearAllLayers();

            this.createElevation(result);

            if (result.geometry.type !== "Point" && result.geometry.type !== "MultiPoint") {
                currentLayer = self._treksgeoJsonLayer;
                type = 'geojson';
                elementLocation = [];
            } else {
                currentLayer = (result.properties.contentType === 'trek' ? self._treksMarkersLayer : self._touristicsMarkersLayer);
                type = 'category';
                elementLocation = utilsFactory.getStartPoint(result);
            }

            self.createLayerFromElement(result, type, elementLocation)
                .then(
                    function (layer) {
                        currentLayer.addLayer(layer);
                        self._clustersLayer.addLayer(currentLayer);
                        if (result.geometry.type !== "Point" && result.geometry.type !== "MultiPoint") {
                            if (globalSettings.SHOW_ARROWS_ON_ROUTE) {
                                layer.setText('    ›    ', {offset: 12, repeat: true, center: true, attributes: {class: 'arrow-direction category-' + result.properties.category.id}});
                            }
                            if (globalSettings.ALWAYS_HIGHLIGHT_TREKS) {
                                self.highlightPath(result, true, true);
                            }
                            if (fitBounds !== false) {
                                self.updateBounds(currentLayer);
                            }
                        } else {
                            if (fitBounds !== false) {
                                self.updateBounds(self._clustersLayer);
                            }
                        }
                    }
                );

            self.createPOISFromElement(result)
                .then(
                    function () {
                        self.map.invalidateSize();
                        //self.updateBounds(self._poisMarkersLayer, 0.5);
                        self.loadingMarkers = false;
                    }
                );
        }

    };

    this.moveEvent = function moveEvent () {
        var map        = this;
        var viewCenter = map.getCenter();
        var pending    = false;

        map.eachLayer(function (layer) {
            if (!(layer instanceof L.TileLayer)) { return false; }
            if (!layer.options.boundsLimit) { return false; }

            layer.options.boundsLimit = boundsLimitService.check(layer.options.boundsLimit);

            var geoJSON = layer.options.boundsLimit.data;
            var gLayer;
            var pip     = [];

            if (geoJSON) {
                gLayer = L.geoJson(geoJSON);
                pip    = L.pip.pointInLayer(viewCenter, gLayer, true);
            } else if (layer.options.boundsLimit.status === 'pending') {
                pending = true;
            }

            if (pip) {
                layer.setOpacity(pip.length);
            }
        });

        if (pending) {
            setTimeout(self.moveEvent.bind(map), 1000);
        }
    };

    this.initMap = function (mapSelector) {

        var permanentTileLayers = layersService.getMainLayersGroup();

        // Set background Layers
        this._baseLayers = {
            main: permanentTileLayers,
            satellite: L.tileLayer(
                globalSettings.ORTHOPHOTO_TILELAYERS.LAYER_URL,
                globalSettings.ORTHOPHOTO_TILELAYERS.OPTIONS
            )
        };

        this._optionalLayers = layersService.getOptionalLayers();

        var mapParameters = {
            center: [globalSettings.LEAFLET_CONF.CENTER_LATITUDE, globalSettings.LEAFLET_CONF.CENTER_LONGITUDE],
            zoom: globalSettings.LEAFLET_CONF.DEFAULT_ZOOM,
            minZoom: globalSettings.LEAFLET_CONF.DEFAULT_MIN_ZOOM,
            maxZoom: globalSettings.LEAFLET_CONF.DEFAULT_MAX_ZOOM,
            scrollWheelZoom: true,
            layers: permanentTileLayers
        };

        if (globalSettings.MAP_BOUNDS_CONSTRAINTS) {
            mapParameters.maxBounds = new L.latLngBounds(globalSettings.MAP_BOUNDS_CONSTRAINTS);
        }

        this.maxZoomFitting = globalSettings.TREKS_TO_GEOJSON_ZOOM_LEVEL - 1;

        //Mixins for map
        this.initCustomsMixins();
        self.filterByViewport = globalSettings.FILTER_BY_VIEWPORT_DEFAULT;

        this.map = L.map(mapSelector, mapParameters);

        this.map.setActiveArea({
            position: 'absolute',
            top: '68px',
            right: '0',
            bottom: '0',
            left: '0'
        });

        this.map.on('moveend', _.throttle(this.moveEvent, 1000, { trailing: true }));

        // Set-up maps controls (needs _map to be defined);
        this.initMapControls();

        //Set-up Layers
        this._nearMarkersLayer = self.createNearLayer();
        this._childMarkersLayer = self.createChildLayer();
        this._clustersLayer = self.createClusterLayer();


        if (globalSettings.ENABLE_TREKS) {
            this._treksMarkersLayer = self.createLayer();
            this._treksgeoJsonLayer = self.createGeoJSONLayer();
        }

        if (globalSettings.ENABLE_TOURISTIC_CONTENT || globalSettings.ENABLE_TOURISTIC_EVENTS) {
            this._touristicsMarkersLayer = self.createLayer();
        }

        this._poisMarkersLayer = self.createPOIsLayer();
        this._infosMarkersLayer = self.createLayer();
        this._servicesMarkersLayer = self.createLayer();

        this.map.addLayer(this._clustersLayer);
        this.map.addLayer(this._poisMarkersLayer);
        this.map.addLayer(this._nearMarkersLayer);
        this.map.addLayer(this._childMarkersLayer);
        this.map.addLayer(this._infosMarkersLayer);
        this.map.addLayer(this._servicesMarkersLayer);

        popupService.setMap(this.map);

        return this.map;

    };

}

function boundsService() {
    this.bounds = {};

    this.setBounds = function (latLngBounds, context) {
        this.bounds[context] = latLngBounds;
        return this.getBounds(context);
    };

    this.getBounds = function (context) {
        if (context) {
            return this.bounds[context];
        } else {
            return this.bounds;
        }
    };

}

function boundsLimitService($http) {

    var dataStore = {};

    this.check = function (boundsLimit) {
        var dataSet = dataStore[boundsLimit.url] || {};

        if (!dataSet.url && boundsLimit.url) {
            dataSet.url = boundsLimit.url;
        }

        if (dataSet.status === 'done') {
            return dataSet;
        }

        if (dataSet.status === 'pending') {
            return dataSet;
        }

        if (dataSet.status === 'fail') {
            return dataSet;
        }

        if (dataSet.status === 'error') {
            return dataSet;
        }

        if (!boundsLimit.url) { return dataSet; }

        var query = $http.get(boundsLimit.url);

        dataSet.status = 'pending';

        query.then(function (resp) {
            // Success
            if (resp.status === 200) {
                dataSet.status = 'done';
                dataSet.data   = resp.data;
            } else {
                dataSet.status = 'error';
            }
            dataStore[boundsLimit.url] = dataSet;
        }, function () {
            // Error
            boundsLimit.status = 'fail';
            dataStore[boundsLimit.url] = dataSet;
        });

        dataStore[boundsLimit.url] = dataSet;

        return dataSet;
    };
}

function popupService() {

    var _map;

    var _setMap = function _setMap (map) {
        _map = map;

        _map.on('unload', _unlockPopup);
        return this;
    };

    this.setMap = _setMap;

    var _infoOpen = false; // Lock to allow only one popup opened at a time

    var _lockPopup = function _lockPopup () {
        _infoOpen = true;
    };

    var _unlockPopup = function _unlockPopup () {
        _infoOpen = false;
    };

    var _isPopupLocked = function _isPopupLocked () {
        return _infoOpen;
    };

    var _getInfoContent = function _getInfoContent () {
        /**
         * Get info content from marker object
         */
        if (this.popupSources) {
            if (this.popupSources.info) {
                if (this.popupSources.info === 'none') {
                    return null;
                }

                return this.popupSources.info;
            }
            if (this.popupSources.selector) {
                return document.querySelector(this.popupSources.selector).outerHTML;
            }
        }

        return null;
    };

    var _getHintContent = function _getHintContent () {
        /**
         * Alt way : if value === 'selector', do like InfoContent
         */
         if (this.popupSources && this.popupSources.hint && this.popupSources.hint === 'selector' && this.popupSources.selector) {
             return document.querySelector(this.popupSources.selector).outerHTML;
         }

        /**
         * New way : get hint content from marker object
         */
        if (this.popupSources && this.popupSources.hint) {
            return this.popupSources.hint;
        }

        /**
         * Fallback (old way) : get hint content form .marker[data-popup]
         */
        var m;
        var markerDom = this._icon;

        if (markerDom instanceof HTMLElement) {
            m = markerDom.querySelector('.marker');
            if (m) {
                return m.getAttribute('data-popup');
            }
        }

        return null;
    };

    var _getContentMethod = {
        hint: _getHintContent,
        info: _getInfoContent
    };

    var _getPopup = function _getPopup (type) {
        if (!this.popupStore) { return false; }

        var popup = this.popupStore[type];
        if (!popup) { return false; }

        var content = popup.getContent();
        if (content) { return popup; } // If popupContent exists: popup is already defined

        content = _getContentMethod[type].call(this);

        if (content) {
            this.popupStore[type].setContent(content);
        }

        return content ? this.popupStore[type] : false;
    };

    var _buildPopupStore = function _buildPopupStore () {
        return _.merge({}, {
            info: L.popup({
                className: 'geotrek-info-popup',
                closeButton: true,
                autoPan: true
            }),
            hint: L.popup({
                className: 'geotrek-hint-popup',
                closeButton: false,
                autoPan: false
            })
        });
    };

    var _doScroll = function _doScroll (eventType) {
        var $ = jQuery;

        if (!$ || !this.popupSources|| !this.popupSources.scroll) { // Test if all needed params exist
            return false;
        }

        if (this.popupSources.scroll.event !== eventType) { // Do we need to scroll for current eventType
            return false;
        }

        var $target = $(this.popupSources.scroll.target);

        if (!$target.length) { // Does scroll target exists
            return false;
        }

        var $container = $target.closest(this.popupSources.scroll.container);

        if (!$container.length) { // If there is no container found, use direct parent element
            $container = $target.parent();
        }

        $container.scrollTo($target, 200);

        return true;
    };

    var _attachPopups = function _attachPopups (marker) {

        marker.popupStore = _buildPopupStore();

        marker.on({
            click: function (e) {
                _doScroll.call(this, e.type);

                var popup = _getPopup.call(this, 'info');

                if (!popup) { return this; }

                this.unbindPopup().bindPopup(popup);
                this.openPopup();

                _lockPopup(); // Disallow opening hintPopup while an infoPopup is open

                return this;
            },

            mouseover: function (e) {
                if (_isPopupLocked()) {
                    return this;
                }

                _doScroll.call(this, e.type);

                var currentPopup = this.getPopup();
                if (currentPopup && currentPopup._isOpen) {
                    return this;
                }

                var popup = _getPopup.call(this, 'hint');

                if (popup && !popup._isOpen) {
                    this.unbindPopup().bindPopup(popup);
                    this.openPopup();
                }

                return this;
            },

            mouseout: function () {
                var popup = this.getPopup();

                if (popup && popup.options && !popup.options.closeButton) {
                    this.closePopup();
                }

                return this;
            },

            popupclose: function () {
                if (_isPopupLocked()) {
                    _unlockPopup(); // Re-allow opening hintPopup
                }

                return this;
            }
        });

        return marker;

    };

    this.attachPopups = _attachPopups; // Publish method
}

function layersService ($http, globalSettings) {

    /**
     * Return PERMANENT_TILELAYERS
     *     or OPTIONAL_TILELAYERS
     *     or PERMANENT_TILELAYERS + OPTIONAL_TILELAYERS
     */
    var _getMainLayersConf = function _getMainLayersConf () {
        if (globalSettings.OPTIONAL_TILELAYERS instanceof Array) {
            if (typeof globalSettings.PERMANENT_TILELAYERS === 'object') {
                return globalSettings.PERMANENT_TILELAYERS.concat(globalSettings.OPTIONAL_TILELAYERS);
            } else {
                return globalSettings.OPTIONAL_TILELAYERS;
            }
        } else if (typeof globalSettings.PERMANENT_TILELAYERS === 'object') {
            return [globalSettings.PERMANENT_TILELAYERS];
        }

        if (globalSettings.PERMANENT_TILELAYERS) {
            return globalSettings.PERMANENT_TILELAYERS;
        }

        return false;
    };

    var _getOptionalLayersConf = function _getOptionalLayersConf () {
        if (globalSettings.OPTIONAL_TILELAYERS) {
            return globalSettings.OPTIONAL_TILELAYERS;
        }

        return false;
    };

    var _getMainLayersGroup = function _getMainLayersGroup () {
        var layersConf = _getMainLayersConf();

        if (!layersConf) { return false; }

        var LGroup = L.layerGroup();
        layersConf.forEach(function (layerConf) {
            var layer, layerOptions;
            if (typeof layerConf === 'string') {
                layer = L.tileLayer(layerConf);
            } else if (layerConf.LAYER_URL) {
                layerOptions = layerConf.OPTIONS || {};

                if (layerConf.BOUNDS) {
                    layerOptions.boundsLimit = {
                        url: layerConf.BOUNDS
                    };
                }

                layer = L.tileLayer(layerConf.LAYER_URL, layerOptions);
            }
            LGroup.addLayer(layer);
        });

        return LGroup;
    };

    var _getOptionalLayers = function _getOptionalLayers () {
        var layersConf  = _getOptionalLayersConf();
        var defaultName = globalSettings.OPTIONAL_TILELAYERS_NAME || 'Layer';

        if (!layersConf) { return false; }

        var layers = {};

        layersConf.forEach(function (layerConf, index) {
            var layerName, layerOptions;
            if (typeof layerConf === 'string') {
                layers[[defaultName, index + 1].join(' ')] = L.tileLayer(layerConf);
            } else if (layerConf.LAYER_URL) {
                layerName = layerConf.LAYER_NAME || [defaultName, index + 1].join(' ');
                if (layerConf.LAYER_URL.split('.').pop() === 'geojson' || layerConf.LAYER_URL.split('.').pop() === 'json') {
                    var options = angular.extend({
                        style: function (feature) {
                            var styles = {};
                            if (feature.properties.fill) {
                                styles.fillColor = feature.properties.fill;
                            }
                            if (feature.properties.stroke) {
                                styles.color = feature.properties.stroke;
                            }
                            return styles;
                        }
                    }, layerConf.OPTIONS);
                    layers[layerName] = new L.GeoJSON.AJAX(layerConf.LAYER_URL, options);
                } else {
                    layerOptions = layerConf.OPTIONS || {};

                    if (layerConf.BOUNDS) {
                        layerOptions.boundsLimit = {
                            url: layerConf.BOUNDS
                        };
                    }

                    layers[layerName] = L.tileLayer(layerConf.LAYER_URL, layerOptions);
                }
            }
        });
        return layers;
    };

    this.getMainLayersGroup = _getMainLayersGroup;
    this.getOptionalLayers  = _getOptionalLayers;
}

module.exports = {
    mapService: mapService,
    boundsService: boundsService,
    boundsLimitService: boundsLimitService,
    popupService: popupService,
    layersService: layersService
};
