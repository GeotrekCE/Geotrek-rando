/* global $http */

'use strict';

function mapService($q, $state, $resource, utilsFactory, globalSettings, translationService, settingsFactory, treksService, poisService, iconsService) {

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
                                self._infosMarkersLayer.addLayer(marker);
                            }
                        )
                );
            } else {
                promises.push(
                    self.createLayerFromElement(element, 'departure', startPoint)
                        .then(
                            function (marker) {
                                self._infosMarkersLayer.addLayer(marker);
                            }
                        )
                );

                promises.push(
                    self.createLayerFromElement(element, 'arrival', endPoint)
                        .then(
                            function (marker) {
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
                                            marker.on({
                                                mouseover: function () {
                                                    var listeEquivalent = document.querySelector(selector);
                                                    if (listeEquivalent) {
                                                        if (!listeEquivalent.classList.contains('hovered')) {
                                                            listeEquivalent.classList.add('hovered');
                                                        }
                                                    }

                                                    var elementOffset = jQuery(selector).position().top;
                                                    var containerScrollPosition = jQuery('.pois-liste').scrollTop();
                                                    if (containerScrollPosition - parseInt(elementOffset, 10) !== 0) {
                                                        jQuery('.pois-liste').animate({
                                                            scrollTop: containerScrollPosition + elementOffset
                                                        }, 300);
                                                    }
                                                },
                                                mouseout: function () {
                                                    var listeEquivalent = document.querySelector(selector);
                                                    if (listeEquivalent) {
                                                        if (listeEquivalent.classList.contains('hovered')) {
                                                            listeEquivalent.classList.remove('hovered');
                                                        }
                                                    }
                                                },
                                                remove: function () {
                                                    var listeEquivalent = document.querySelector(selector);
                                                    if (listeEquivalent) {
                                                        if (listeEquivalent.classList.contains('hovered')) {
                                                            listeEquivalent.classList.remove('hovered');
                                                        }
                                                    }
                                                },
                                                click: function () {
                                                    //$state.go("layout.detail", { catSlug: result.properties.category.slug, slug: result.properties.slug });
                                                }
                                            });
                                            self._poisMarkersLayer.addLayer(marker);
                                        }
                                    );
                            });
                        }
                    )
            );
        }

        $q.all(promises)
            .then(
                function () {
                    deferred.resolve(true);
                }
            );

        return deferred.promise;
    };

    this.createElementsMarkers = function (elements, type) {
        var startPoint = [];
        _.forEach(elements, function (element) {
            startPoint = utilsFactory.getStartPoint(element);
            self.createLayerFromElement(element, 'category', startPoint)
                .then(
                    function (marker) {
                        marker.options.icon.options.className += ' ' + type + '-marker';
                        var selector = '#' + type + '-category-' + element.properties.category.id + '-' + element.id;
                        marker.on({
                            mouseover: function () {
                                var listeEquivalent = document.querySelector(selector);
                                if (listeEquivalent) {
                                    if (!listeEquivalent.classList.contains('hovered')) {
                                        listeEquivalent.classList.add('hovered');
                                    }
                                }
                            },
                            mouseout: function () {
                                var listeEquivalent = document.querySelector(selector);
                                if (listeEquivalent) {
                                    if (listeEquivalent.classList.contains('hovered')) {
                                        listeEquivalent.classList.remove('hovered');
                                    }
                                }
                            },
                            remove: function () {
                                var listeEquivalent = document.querySelector(selector);
                                if (listeEquivalent) {
                                    if (listeEquivalent.classList.contains('hovered')) {
                                        listeEquivalent.classList.remove('hovered');
                                    }
                                }
                            },
                            click: function () {
                                $state.go("layout.detail", { catSlug: element.properties.category.slug, slug: element.properties.slug });
                            }
                        });
                        self._nearMarkersLayer.addLayer(marker);
                    }
                );
        });
    };

    this.createLayerFromElement = function (element, type, elementLocation) {
        var deferred = $q.defer();

        if (type === "geojson") {
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
            case 'category':
                promise = iconsService.getElementIcon;
                param = element;
                break;

            case 'poi':
                promise = iconsService.getPOIIcon;
                param = element;
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
        this.createSatelliteView();
        this.setResetViewControl();
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

    this.setResetViewControl = function () {
        L.Control.Resetview = L.Control.extend({
            options: {
                position: 'topright'
            },
            onAdd: function () {
                var controlContainer = L.DomUtil.create('div', 'leaflet-control-resetview leaflet-bar');
                var controlButton = L.DomUtil.create('a', 'leaflet-control-resetview-button', controlContainer);
                controlButton.title = 'Reset view';

                L.DomEvent.disableClickPropagation(controlButton);
                L.DomEvent.on(controlButton, 'click', function () {
                    var layers = [self._clustersLayer];
                    if (self._treksgeoJsonLayer) {
                        layers.push(self._treksgeoJsonLayer);
                    }

                    self.updateBounds(true, layers);
                }, this);
                return controlContainer;
            }
        });

        this.resetViewControl = new L.Control.Resetview();
        this.map.addControl(this.resetViewControl);
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
                var controlCaption = L.DomUtil.create('span', 'leaflet-control-viewportfilter-caption', controlContainer);
                controlCaption.innerHTML = 'Filter when I move the map';

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
            var miniMapLayer = new L.tileLayer(
                    globalSettings.MAIN_LEAFLET_BACKGROUND.LAYER_URL,
                    {
                        minZoom: globalSettings.MINIMAP_ZOOM.MINI,
                        maxZoom: globalSettings.MINIMAP_ZOOM.MAX,
                        attribution: globalSettings.MAIN_LEAFLET_BACKGROUND.ATTRIBUTION
                    }
                ),
                miniMapOptions = {
                    toggleDisplay: true,
                    zoomLevelOffset: globalSettings.MINIMAP_OFFSET
                };

            this._miniMap = new L.Control.MiniMap(miniMapLayer, miniMapOptions).addTo(this.map);
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
                this.button.title = 'Show satellite';

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
                } else {
                    this.map.switchLayer(this.map.getZoom() > this.switch_detail_zoom ? 'detail' : 'main');

                    L.DomUtil.removeClass(this.button, 'main');
                    L.DomUtil.addClass(this.button, 'satellite');
                }
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

    this.createTouristicLayer = function () {

        var clusterLayer = new L.MarkerClusterGroup({
            showCoverageOnHover: false,
            disableClusteringAtZoom: globalSettings.LEAFLET_CONF.DEFAULT_MAX_ZOOM,
            iconCreateFunction: function (cluster) {
                return iconsService.getTouristicClusterIcon(cluster);
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

        if (globalSettings.ENABLE_TREKS) {
            self._treksMarkersLayer.clearLayers();
            self._treksgeoJsonLayer.clearLayers();
        }

        if (globalSettings.ENABLE_TOURISTIC_CONTENT || globalSettings.ENABLE_TOURISTIC_EVENTS) {
            self._touristicsMarkersLayer.clearLayers();
        }

    };

    this.updateBounds = function (updateBounds, layers, padding) {
        var globalBounds = layers[0].getBounds();
        if (layers.length > 1) {
            var i = 1;
            for (i; i < layers.length; i++) {
                globalBounds.extend(layers[i].getBounds());
            }
        }
        if (padding === undefined || padding < 0) {
            padding = 0;
        }
        if ((updateBounds === undefined) || (updateBounds === true)) {
            self.map.fitBounds(globalBounds, {padding: padding, maxZoom: self.maxZoomFitting, animate: false});
        }

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
                if (layer.options.result.geometry.type !== 'Point' && !self.treksIconified) {
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

        var url = settingsFactory.trekUrl.replace(/\$lang/, translationService.getCurrentLang().code) + result.id + '/' + globalSettings.PROFILE_FILE;
        var requests = $resource(url, {}, {
            query: {
                method: 'GET'
            }
        }, {stripTrailingSlashes: false});

        requests.query().$promise
            .then(function (data) {
                var primaryColor = window.getComputedStyle(document.querySelector('.informations .element-title')).backgroundColor;
                var transparentizedColor = primaryColor.replace(/^(rgb)\((\d{1,3},\s*\d{1,3},\s*\d{1,3})\)$/gm, '$1a($2, 0.8)');

                function updateSparkline() {
                    jQuery('#elevation .canvas-container').sparkline(data.profile,
                        L.Util.extend(
                            {
                                tooltipSuffix: ' m',
                                numberDigitGroupSep: '',
                                width: '100%',
                                height: 150
                            },
                            {
                                type: 'line',
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
                    jQuery('#mouseoverprofil').text(Math.round(region.x) + "m");
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
    this.displayResults = function (results, updateBounds) {

        var counter = 0;

        this.maxZoomFitting = globalSettings.TREKS_TO_GEOJSON_ZOOM_LEVEL - 1;

        if (!self.loadingMarkers) {
            self.loadingMarkers = true;
            self.currentResults = results;

            this.treksIconified = this.map.getZoom() < globalSettings.TREKS_TO_GEOJSON_ZOOM_LEVEL;
            this.clearAllLayers();

            _.forEach(results, function (result) {

                counter++;

                var currentLayer,
                    elementLocation,
                    currentCount = counter,
                    type = '';

                if (result.geometry.type !== "Point" && !self.treksIconified) {
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
                        );
                }

                currentLayer = (result.properties.contentType === 'trek' ? self._treksMarkersLayer : self._touristicsMarkersLayer);
                type = 'category';
                elementLocation = utilsFactory.getStartPoint(result);

                self.createLayerFromElement(result, type, elementLocation)
                    .then(
                        function (layer) {
                            var selector = '#result-category-' + result.properties.category.id.toString() + '-' + result.id.toString();

                            layer.on({
                                mouseover: function () {
                                    var listeEquivalent = document.querySelector(selector);
                                    if (listeEquivalent) {
                                        if (!listeEquivalent.classList.contains('hovered')) {
                                            listeEquivalent.classList.add('hovered');
                                        }
                                    }
                                    if (result.geometry.type !== "Point") {
                                        self.highlightPath(result);
                                    }
                                },
                                mouseout: function () {
                                    var listeEquivalent = document.querySelector(selector);
                                    if (listeEquivalent) {
                                        if (listeEquivalent.classList.contains('hovered')) {
                                            listeEquivalent.classList.remove('hovered');
                                        }
                                    }
                                    if (self.geoHover) {
                                        self._nearMarkersLayer.removeLayer(self.geoHover);
                                    }
                                },
                                remove: function () {
                                    var listeEquivalent = document.querySelector(selector);
                                    if (listeEquivalent) {
                                        if (listeEquivalent.classList.contains('hovered')) {
                                            listeEquivalent.classList.remove('hovered');
                                        }
                                    }
                                },
                                click: function () {
                                    $state.go("layout.detail", { catSlug: result.properties.category.slug, slug: result.properties.slug });
                                }
                            });
                            if (result.geometry.type !== "Point") {
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
                                self.updateBounds(updateBounds, [self._clustersLayer]);
                                self.resultsVisibility();
                                self.map.on('moveend', self.resultsVisibility);
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

        this.maxZoomFitting = globalSettings.DEFAULT_MAX_ZOOM;

        if (!self.loadingMarkers) {

            self.map.off('moveend', self.resultsVisibility);

            self.loadingMarkers = true;

            this.clearAllLayers();

            this.createElevation(result);

            if (result.geometry.type !== "Point") {
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
                        if (result.geometry.type !== "Point") {
                            if (globalSettings.ALWAYS_HIGHLIGHT_TREKS) {
                                self.highlightPath(result, true, true);
                            }
                            self.updateBounds(updateBounds, [currentLayer]);
                        } else {
                            self.updateBounds(updateBounds, [self._clustersLayer]);
                        }
                    }
                );

            self.createPOISFromElement(result)
                .then(
                    function () {
                        self.map.invalidateSize();
                        //self.updateBounds(true, self._poisMarkersLayer, 0.5);
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
                globalSettings.MAIN_LEAFLET_BACKGROUND.OPTIONS
            ),
            satellite: L.tileLayer(
                globalSettings.SATELLITE_LEAFLET_BACKGROUND.LAYER_URL,
                globalSettings.SATELLITE_LEAFLET_BACKGROUND.OPTIONS
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

        this.maxZoomFitting = globalSettings.TREKS_TO_GEOJSON_ZOOM_LEVEL - 1;

        //Mixins for map
        this.initCustomsMixins();
        self.filterByViewport = false;

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

        this._poisMarkersLayer = self.createPOIsLayer();
        this._nearMarkersLayer = self.createTouristicLayer();
        this._infosMarkersLayer = self.createLayer();

        this.map.addLayer(this._clustersLayer);
        this.map.addLayer(this._poisMarkersLayer);
        this.map.addLayer(this._nearMarkersLayer);
        this.map.addLayer(this._infosMarkersLayer);

        return this.map;

    };

}

function iconsService($resource, $q, globalSettings, categoriesService, poisService, utilsFactory) {

    var self = this;

    this.icons_liste = {
        default_icon: {},
        departure: globalSettings.DEPARTURE_ICON || {
            iconUrl: '/images/map/departure.svg',
            iconSize: [46, 52],
            iconAnchor: [23, 52],
            className: 'departure-marker'
        },
        arrival: globalSettings.ARRIVAL_ICON || {
            iconUrl: '/images/map/arrival.svg',
            iconSize: [46, 52],
            iconAnchor: [13, 52],
            className: 'arrival-marker'
        },
        departureArrival: globalSettings.DEPARTURE_ARRIVAL_ICON || {
            iconUrl: '/images/map/departure-arrival.svg',
            iconSize: [46, 52],
            iconAnchor: [13, 52],
            className: 'departure-arrival-marker'
        },
        parking: globalSettings.PARKING_ICON || {
            iconUrl: '/images/map/parking.svg',
            iconSize: [20, 20],
            iconAnchor: [10, 20],
            labelAnchor: [10, 10],
            className: 'parking-marker'
        },
        information: globalSettings.INFO_ICON || {
            iconUrl: '/images/map/info.svg',
            iconSize: [],
            iconAnchor: [],
            labelAnchor: [],
            className: ''
        },
        ref_point: {
            iconUrl: '',
            iconSize: [26 ,26],
            iconAnchor: [13, 26],
            labelAnchor: [13, 13],
            className: 'ref-point'
        },
        poi: {
            iconUrl: '',
            iconSize: [],
            iconAnchor: [],
            labelAnchor: [],
            className: ''
        },
        category_base: globalSettings.MARKER_BASE_ICON || {
            iconUrl: '/images/map/category_base.svg',
            iconSize: [34, 48],
            iconAnchor: [17, 48],
            labelAnchor: [17, 17]
        },
        poi_base: globalSettings.POI_BASE_ICON || {
            iconUrl: '/images/map/category_base.svg',
            iconSize: [34, 48],
            iconAnchor: [17, 48],
            labelAnchor: [17, 17]
        },
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

                            if (utilsFactory.isSVG(category.pictogram)) {
                                var requests = $resource(category.pictogram, {}, {
                                    query: {
                                        method: 'GET',
                                        cache: true
                                    }
                                });

                                requests.query().$promise
                                    .then(function (icon) {
                                        var finalIcon = '';
                                        _.each(icon, function(el, index) {
                                            if (!isNaN(parseInt(index, 10))) {
                                                finalIcon += el;
                                            }
                                        });
                                        self.categoriesIcons[category.id] = finalIcon;
                                            if (currentCounter === _.size(categories)) {
                                                deferred.resolve(self.categoriesIcons);
                                            }
                                    });
                            } else {
                                self.categoriesIcons[category.id] = '<img src="' + category.pictogram + '" />';
                                if (currentCounter === _.size(categories)) {
                                    deferred.resolve(self.categoriesIcons);
                                }
                            }

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

    this.getPoiTypesIcons = function (forceRefresh) {
        var deferred = $q.defer();

        if (self.poisTypesIcons && !forceRefresh) {
            deferred.resolve(self.poisTypesIcons);
        } else {

            poisService.getPois(forceRefresh)
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
                                if (currentCounter === _.size(pois.features)) {
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
                                            if (currentCounter === _.size(pois.features)) {
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

    this.getAPoiTypeIcon = function (poiTypeId, forceRefresh) {
        var deferred = $q.defer();
        if (self.poisTypesIcons && !forceRefresh) {
            deferred.resolve(self.poisTypesIcons[poiTypeId]);
        } else {
            self.getPoiTypesIcons(forceRefresh)
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
            var requests = $resource(url, {}, {
                query: {
                    method: 'GET',
                    cache: true
                }
            });

            requests.query().$promise
                .then(function (icon) {
                    var finalIcon = '';
                    _.each(icon, function(el, index) {
                        if (!isNaN(parseInt(index, 10))) {
                            finalIcon += el;
                        }
                    });
                    self.icons_liste[iconName].markup = finalIcon;
                    deferred.resolve(finalIcon);
                });
        }

        return deferred.promise;
    };

    this.getClusterIcon = function (cluster) {
        return new L.DivIcon({
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            className: 'element-cluster',
            html: '<div class="marker"><span class="count">' + cluster.getChildCount() + '</span></div>'
        });
    };

    this.getTouristicClusterIcon = function (cluster) {
        return new L.DivIcon({
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            className: 'touristic-cluster',
            html: '<div class="marker"><span class="count">' + cluster.getChildCount() + '</span></div>'
        });
    };

    this.getPOIClusterIcon = function (cluster) {
        var children = cluster.getAllChildMarkers(),
            iconsMarkup = '',
            i = 0,
            icons = {ICON0: '', ICON1: '', ICON2: '', ICON3: ''},
            template = '' +
                '<div class="icon-group">' +
                    '<div class="icon">{ICON0}</div>' +
                    '<div class="icon">{ICON1}</div>' +
                    '<div class="icon">{ICON2}</div>' +
                    '<div class="icon">{ICON3}</div>' +
                '</div>';

        for (i = 0; i < Math.min(children.length, 4); i++) {
            if (children[i].options.result && children[i].options.result.properties.type) {
                icons['ICON'+i] = '<img src="' + children[i].options.result.properties.type.pictogram + '"/>';
            }
        }
        iconsMarkup = L.Util.template(template, icons);

        return new L.DivIcon({
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            className: 'poi-cluster',
            html: iconsMarkup
        });
    };

    this.getRefIcon = function (refElement) {
        var deferred = $q.defer();

        var markup = '<span>' + refElement.order + '</span>';

        var newIcon = new L.divIcon({
            html: markup,
            iconSize: self.icons_liste.ref_point.iconSize,
            iconAnchor: self.icons_liste.ref_point.iconAnchor,
            labelAnchor: self.icons_liste.ref_point.labelAnchor,
            className: self.icons_liste.ref_point.className + ' ' + self.icons_liste.ref_point.className + '-' + refElement.order
        });
        deferred.resolve(newIcon);

        return deferred.promise;
    };

    this.getIcon = function (iconName) {
        var deferred = $q.defer();

        if (!iconName || !self.icons_liste[iconName]) {
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
            baseIcon = null,
            poiIcon = null,
            promises = [];

        if (self.icons_liste.poi_base.iconUrl) {
            promises.push(
                self.getSVGIcon(self.icons_liste.poi_base.iconUrl, 'poi_base')
                    .then(
                        function (icon) {
                            baseIcon = icon;
                        }
                    )
            );
        }

        promises.push(
            self.getAPoiTypeIcon(poi.properties.type.id, false)
                .then(
                    function (icon) {
                        if (icon.isSVG) {
                            poiIcon = icon.markup;
                        } else {
                            poiIcon = '<img src="' + icon.markup + '" alt=""';
                        }
                    }
                )
        );

        $q.all(promises)
            .then(
                function () {
                    var markup;

                    if (baseIcon) {
                        markup = '' +
                            '<div class="marker" data-popup="' + poi.properties.name + '">' +
                                baseIcon +
                            '</div>' +
                            '<div class="icon">' + poiIcon + '</div>';
                    } else {
                       markup = '' +
                            '<div class="marker" data-popup="' + poi.properties.name + '">' +
                                '<div class="icon">' + poiIcon + '</div>' +
                            '</div>';
                    }

                    var newIcon = new L.divIcon({
                        html: markup,
                        iconSize: self.icons_liste.poi_base.iconSize,
                        iconAnchor: self.icons_liste.poi_base.iconAnchor,
                        labelAnchor: self.icons_liste.poi_base.labelAnchor,
                        className: 'double-marker popup poi layer-' + poi.properties.type.id + '-' + poi.id + ' category-' + poi.properties.type.id
                    });
                    deferred.resolve(newIcon);
                }
            );

        return deferred.promise;

    };

    this.getWarningIcon = function () {
        var deferred = $q.defer();

        self.getSVGIcon(self.icons_liste.poi_base.iconUrl, 'category_base')
            .then(function (icon) {
                var markup = '' +
                    '<div class="marker">' +
                        icon +
                    '</div>' +
                    '<div class="icon"><i class="fa fa-exclamation-circle"></i></div>';

                var warningIcon = new L.DivIcon({
                    html: markup,
                    iconSize: self.icons_liste.poi_base.iconSize,
                    iconAnchor: self.icons_liste.poi_base.iconAnchor,
                    labelAnchor: self.icons_liste.poi_base.labelAnchor,
                    className: 'double-marker warning-marker'
                });

                deferred.resolve(warningIcon);
            });

        return deferred.promise;
    };

    this.getElementIcon = function (element) {

        var deferred = $q.defer(),
            markerIcon,
            categoryIcon,
            promises = [];

        if (utilsFactory.isSVG(self.icons_liste.category_base.iconUrl)) {
            promises.push(
                self.getSVGIcon(self.icons_liste.category_base.iconUrl, 'category_base')
                    .then(
                        function (icon) {
                            markerIcon = icon;
                        }
                    )
            );
        } else {
            markerIcon = '<img src="' + self.icons_liste.category_base.iconUrl + '"/>';
        }

        promises.push(
            self.getCategoryIcon(element.properties.category.id)
                .then(
                    function (icon) {
                        categoryIcon = icon;
                    }
                )
        );

        $q.all(promises).then(
            function () {
                var markup = '' +
                    '<div class="marker" data-popup="' + element.properties.name + '">' +
                        markerIcon +
                    '</div>' +
                    '<div class="icon">' + categoryIcon + '</div>';

                var newIcon = new L.divIcon({
                    html: markup,
                    iconSize: self.icons_liste.category_base.iconSize,
                    iconAnchor: self.icons_liste.category_base.iconAnchor,
                    labelAnchor: self.icons_liste.category_base.labelAnchor,
                    className: 'double-marker popup layer-category-' + element.properties.category.id + '-' + element.id + ' category-' + element.properties.category.id
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
