Rando.views.TrekDetailView = Rando.views.DetailView.extend({

    getObjectLayer: function () {
        var layer = Rando.views.DetailView.prototype.getObjectLayer.call(this);
        return layer;
    },


    getWholeBounds: function () {
        return this.getObjectLayer().getBounds();
    },


    setupMap: function (map) {
        Rando.views.DetailView.prototype.setupMap.call(this, map);

        // Temporary code : will be moved to view methods
        var trekGeoJson = JSON.parse(document.getElementById('object-geojson').innerHTML);
        var trekLayer = initDetailTrekMap(map, trekGeoJson);
        initDetailPointsReference(map, trekGeoJson);
        var poiUrl = $(map._container).data('poi-url');
        var informationDeskUrl = $(map._container).data('information-desk-url');
        var parking = initDetailParking(map, trekGeoJson);
        var wholeBounds = trekLayer.getBounds().padTop(0.12);
        if (parking) {
            wholeBounds.extend(parking.getLatLng());
        }
        map.fitBounds(wholeBounds);
        var poisLayer = initDetailPoisLayer(map, poiUrl);
        var hasPOIs = initPOIsList(map);
        initDetailInformationDesksLayer(map, informationDeskUrl);
        if (hasPOIs) {
            var poisLayerSwitcher = new L.Control.TogglePOILayer(poisLayer);
            poisLayerSwitcher.addTo(map);
            map.poisLayerSwitcher = poisLayerSwitcher;
        }
    },


    render: function () {
        Rando.views.DetailView.prototype.render.call(this);

        // Load altimetric graph
        var jsonurl = $('#altitudegraph').data('url');
        this._altimetricInit(jsonurl);
    },


    _altimetricInit: function(jsonurl) {
        /*
         * Load altimetric profile from JSON
         */
        $.getJSON(jsonurl, function(data) {
            function updateSparkline() {
                $('#profilealtitude').sparkline(data.profile, L.Util.extend({
                    tooltipSuffix: ' m',
                    numberDigitGroupSep: '',
                    width: '100%',
                    height: 100
                }, ALTIMETRIC_PROFILE_OPTIONS));
            }

            updateSparkline();

            $(window).smartresize(function() {
                updateSparkline();
            });

            $('#profilealtitude').bind('sparklineRegionChange', function(ev) {
                var sparkline = ev.sparklines[0],
                    region = sparkline.getCurrentRegionFields();
                    value = region.y;
                $('#mouseoverprofil').text(Math.round(region.x) +"m");
                // Trigger global event
                $('#profilealtitude').trigger('hover:distance', region.x);
            }).bind('mouseleave', function() {
                $('#mouseoverprofil').text('');
                $('#profilealtitude').trigger('hover:distance', null);
            });

        });

        /*
         * Interaction with detail map
         */
        var map = this._map;
        var layer = this.getObjectLayer();

        var marker = null;
        $('#profilealtitude').on('hover:distance', function (event, meters) {
            if (marker) {
                map.removeLayer(marker);
                marker = null;
            }
            if (meters === null)
                return;
            layer.eachLayer(function (layer) {
                if (layer instanceof L.MultiPolyline)
                    return;
                var latLng = Rando.utils.latLngAtDistance(layer, meters);
                if (latLng) {
                    marker = L.circleMarker(latLng, TREK_LAYER_OPTIONS.positionstyle).setRadius(5).addTo(map);
                }
            });
        });
    }
});


function initDetailTrekMap(map, trekGeoJson) {
    // Trek
    var highlight = new L.GeoJSON(trekGeoJson.geometry, {style: L.extend(TREK_LAYER_OPTIONS.outlinestyle, {clickable: false})})
                         .addTo(map);
    var trekLayer = new L.GeoJSON(trekGeoJson.geometry, {style: L.extend(TREK_LAYER_OPTIONS.hoverstyle, {clickable: false})})
                            .addTo(map);

    // Show start and end
    trekLayer.eachLayer(function (layer) {
        if (layer instanceof L.MultiPolyline)
            return;
        if (layer instanceof L.Marker)
            return;

        // Do not try to draw path orientation if no SVG support
        if (!$('html').hasClass('no-svg')) {
            map.whenReady(function () {
                var textPath = L.polyline(layer.getLatLngs(), {weight: 0}).addTo(map);
                textPath.setText('>     ', {repeat:true, offset: TREK_LAYER_OPTIONS.outlinestyle.weight * 0.75, attributes: TREK_LAYER_OPTIONS.arrowstyle});
            });
        }

        var departureLabel = gettext("Departure"),
            arrivalLabel = gettext("Arrival");

        if (!/^\s*$/.test(trekGeoJson.properties.departure)) {
            departureLabel += ("&nbsp;: " + trekGeoJson.properties.departure);
        }
        if (!/^\s*$/.test(trekGeoJson.properties.arrival)) {
            arrivalLabel += ("&nbsp;: " + trekGeoJson.properties.arrival);
        }

        L.marker(layer.getLatLngs().slice(-1)[0],
                 {icon: new L.Icon({
                                iconUrl: IMG_URL + '/marker-target.png',
                                iconSize: [64, 64],
                                iconAnchor: [32, 64],
                                labelAnchor: [-3, -50]
                 }),
                 riseOnHover: true})
          .bindLabel(arrivalLabel, {className: 'arrival'})
          .addTo(map);
        L.marker(layer.getLatLngs()[0],
                 {icon: new L.Icon({
                                iconUrl: IMG_URL + '/marker-source.png',
                                iconSize: [64, 64],
                                iconAnchor: [32, 64],
                                labelAnchor: [20, -50]
                    }),
                  riseOnHover: true})
          .bindLabel(departureLabel, {className: 'departure'})
          .addTo(map);
    });

    return trekLayer;
}

function initDetailParking(map, trekGeoJson) {
    var size = DETAIL_MAP_OPTIONS.icons.parking.size;
    var parkingIcon = L.icon({
        iconUrl: IMG_URL + '/parking.png',
        iconSize: [size, size],
        iconAnchor: [0, 0],
        labelAnchor: [size-4, size/2]
    });
    var parkingLocation = trekGeoJson.properties.parking_location;
    if (parkingLocation) {
        var pos = L.latLng([parkingLocation[1], parkingLocation[0]]);
        return L.marker(pos, {icon: parkingIcon, riseOnHover: true})
                .bindLabel(trekGeoJson.properties.advised_parking || gettext("Recommended parking"), {className: 'parking'})
                .addTo(map);
    }
    return null;
}


function initDetailInformationDesksLayer(map, layerUrl) {
    var size = DETAIL_MAP_OPTIONS.icons.information.size;
    var deskIcon = L.icon({
        iconUrl: IMG_URL + '/information.svg',
        iconSize: [size, size],
        iconAnchor: [size/2, size/2]
    });
    var layer = L.geoJson.ajax(layerUrl, {
        pointToLayer: function (feature, latlng) {
            var popup = L.popup({
                className: 'information-desk'
            })
            .setContent(feature.properties.html);
            return L.marker(latlng, {icon: deskIcon})
                    .bindPopup(popup);
        }
    });
    layer.addTo(map);
    return layer;
}


function initDetailPointsReference(map, trekGeoJson) {
    var pointsReference = trekGeoJson.properties.points_reference;
    if (pointsReference) {
        L.geoJson(pointsReference, {
            pointToLayer: (function () {
                var counter = 1;
                return function (featureData, latlng) {
                    var size = DETAIL_MAP_OPTIONS.icons.pointsReference.size;
                    var icon = L.divIcon({html: counter++,
                                          iconSize: [size, size],
                                          iconAnchor: [size/2, size/2],
                                          className: 'point-reference'});
                    return L.marker(latlng, {
                        clickable: false,
                        icon: icon
                    }).addTo(map);
                };
            })()
        }).addTo(map);
    }
    return null;
}


function initDetailPoisLayer(map, poiUrl) {
    // We don't use L.GeoJSON.AJAX because POILayer already inherits
    // from MarkerCluster.
    var poisLayer = new POILayer();
    var poisMarkersById = {};

    $.getJSON(poiUrl, function (data) {
        poisLayer.addData(data);
        poisLayer.fire('data:loaded');

        poisLayer.eachLayer(function (marker) {
            var pk = marker.properties.pk;
            poisMarkersById[pk] = marker;

            marker.on('mouseintent', function (e) {
                $(window).trigger('poimap:mouseover', [pk]);
            });
        });
    });

    function getMarker(pk) {
        var marker = poisMarkersById[pk+''];
        if (!marker) {
            console.warn('POI ' + pk + ' unknown');
            return null;
        }
        var visibleOne = poisLayer.getVisibleParent(marker);
        if (visibleOne) {
            return visibleOne;
        }
        return marker;
    }

    $(window).off('poilist:mouseover').on('poilist:mouseover', function (e, pk) {
        var marker = getMarker(pk);
        if (!marker) return;

        if (typeof marker.showLabel == 'function') {
            marker.showLabel();
        }
        $(marker._icon).addClass('highlight');
        $(marker._icon).css('z-index', 3000);

        var sidepanelw = $('#pois-sidebar').width();
        map.panToOffset(marker.getLatLng(), [-sidepanelw/2, 0],
                        DETAIL_POI_OPTIONS.pan);
    });

    $(window).off('poilist:mouseout').on('poilist:mouseout', function (e, pk) {
        var marker = getMarker(pk);
        if (!marker) return;
        if (typeof marker.hideLabel == 'function') {
            marker.hideLabel();
        }
        $(marker._icon).removeClass('highlight');
    });
    return poisLayer.addTo(map);
}

function initPOIsList(map) {
    if (!L.DomUtil.get('pois-sidebar')) {
        return false;
    }

    var poiSidebar = L.control.sidebar('pois-sidebar', {
        closeButton: false,
        position: 'right'
    });

    $(window).off('pois:shown').on('pois:shown', function () {
        poiSidebar.show();
    });
    $(window).off('pois:hidden').on('pois:hidden', function () {
        poiSidebar.hide();
    });

    $(window).off('map:ready').on('map:ready', function () {
        map.addControl(poiSidebar);

        var $sidebar = $('#pois-sidebar');

        if ($sidebar.hasClass('default-opened'))
            poiSidebar.show();
        else
            map.poisLayerSwitcher.toggleLayer();

        $sidebar.find('.pictogram').tooltip({placement: 'right'});

        // Hilight marker when list hovered
        $sidebar.find('.poi').hoverIntent(
            function enter() {
                $(this).addClass('active');
                $(window).trigger('poilist:mouseover', [$(this).data('pk')]);
            },
            function leave() {
                $(this).removeClass('active');
                $(window).trigger('poilist:mouseout', [$(this).data('pk')]);
            }
        );

        $sidebar.find('.jump').click(function (e) {
            var up = $(this).hasClass('up'),
                $poi = $(this).closest('.poi'),
                pk = $poi.data('pk');
            var $jump = $poi.next('.poi');
            if (up) {
                $jump = $poi.prev('.poi');
            }
            $(window).trigger('poimap:mouseover', [$jump.data('pk')]);
            e.preventDefault();
        });

        // Scroll to detail when marker hovered
        $(window).off('poimap:mouseover').on('poimap:mouseover', function (e, pk) {
            var $item = $sidebar.find('.poi[data-pk=' + pk + ']');
            var scrollTo = $item.parent().scrollTop() +
                           $item.offset().top -
                           $item.parent().offset().top +
                           DETAIL_POI_OPTIONS.listMarginTop;  // padding + margin

            $sidebar.animate({ scrollTop: scrollTo }, DETAIL_POI_OPTIONS.scroll);
        });

        // Prevent scrolling page when bottom reached
        $sidebar.bind('mousewheel DOMMouseScroll', function ( e ) {
            var e0 = e.originalEvent,
                delta = e0.wheelDelta || -e0.detail;

            this.scrollTop += ( delta < 0 ? 1 : -1 ) * 30;
            e.preventDefault();
        });

        // Show carousel on click
        $sidebar.find('.poi .picture').click(function () {
            var pk = $(this).closest('.poi').data('pk');
            var $popup = $("#popup-poi-carousel-" + pk);
            $popup.on('shown', function () {
                $popup.carousel();
            });
            $popup.modal('show');
        });

    });

    return true;
}
