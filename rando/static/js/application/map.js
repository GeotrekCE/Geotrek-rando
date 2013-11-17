var TREK_LAYER_OPTIONS = L.Util.extend({
    style: {'color': '#F89406', 'weight': 5, 'opacity': 0.8},
    hoverstyle: {'color': '#F89406', 'weight': 5, 'opacity': 1.0},
    outlinestyle: {'color': 'yellow', 'weight': 10, 'opacity': 0.8},
    arrowstyle: {'fill': '#E97000', 'font-weight': 'bold'},
    positionstyle: {'fillOpacity': 1.0, 'opacity': 1.0, 'fillColor': 'white', 'color': 'black', 'width': 3},
    iconifyZoom: 12,
    clusterOptions: {
        showCoverageOnHover: false,
        maxClusterRadius: 36,
    }
}, TREK_LAYER_OPTIONS || {});


function invalidate_maps() {
    if (window.maps) {
        $.each(window.maps, function (i, map) {
            map.invalidateSize();
        });
    }
}


var TrekLayer = L.ObjectsLayer.extend({

    initialize: function (geojson) {
        var options = $.extend({
                highlight: true
            },
            TREK_LAYER_OPTIONS
        );
        L.ObjectsLayer.prototype.initialize.call(this, geojson, options);

        var clusterOptions = L.Util.extend(TREK_LAYER_OPTIONS.clusterOptions, {
            iconCreateFunction: this._getTrekClusterIcon.bind(this)
        });
        this._trekCluster = new L.MarkerClusterGroup(clusterOptions);

        this._hover = null;
        this._iconified = null;
    },

    highlight: function (pk, on) {
        var layer = this.getLayer(pk);
        on = on === undefined ? true : on;
        if (!layer) return;
        if (!this._map) return;
        if (on) {
            if (layer.iconified) {
                L.DomUtil.addClass(layer.marker._icon, 'highlight');
                return;
            }

            if (layer instanceof L.Polyline) {
                this._hover = new L.Polyline(layer.getLatLngs());
            }
            else if (layer instanceof L.MultiPolyline) {
                var coords = [];
                layer.eachLayer(function (l) { coords.push(l.getLatLngs()); });
                this._hover = new L.MultiPolyline(coords);
            }
            this._hover.setStyle(TREK_LAYER_OPTIONS.outlinestyle);
            this._hover.addTo(this._map).bringToBack();
            // Pop on top
            layer.setStyle(TREK_LAYER_OPTIONS.hoverstyle);
            // See https://groups.google.com/forum/#!topic/d3-js/OqD9_puVTfg
            // and http://leafletjs.com/examples/choropleth.html
            if (!L.Browser.ie && !L.Browser.opera) {
                layer.bringToFront();
            }
        }
        else {
            if (layer.iconified) {
                L.DomUtil.removeClass(layer.marker._icon, 'highlight');
            }
            else {
                if (this._hover) this._map.removeLayer(this._hover);
                layer.setStyle(TREK_LAYER_OPTIONS.style);
            }
        }
    },

    onAdd: function (map) {
        L.ObjectsLayer.prototype.onAdd.apply(this, arguments);
        map.on('zoomend', this._iconifyTreks, this);
        map.whenReady(function () {
            this._iconifyTreks();
        }, this);
        this._trekCluster.addTo(map);
    },

    onRemove: function () {
        this._map.removeLayer(this._trekCluster);
        map.off('zoomend', this._iconifyTreks, this);
        L.ObjectsLayer.prototype.onRemove.apply(this, arguments);
    },

    addLayer: function (layer) {
        if (layer.iconified) {
            this._trekCluster.addLayer(layer.marker);
            return;
        }
        else if (layer.marker && this._map) {
            this._map.addLayer(layer.marker);
        }
        return L.ObjectsLayer.prototype.addLayer.call(this, layer);
    },

    removeLayer: function (layer) {
        if (layer.marker && this._map) {
            this._trekCluster.removeLayer(layer.marker);
            this._map.removeLayer(layer.marker);
        }
        return L.ObjectsLayer.prototype.removeLayer.call(this, layer);
    },

    _iconifyTreks: function (e) {
        var zoom = this._map.getZoom(),
            iconified = zoom < TREK_LAYER_OPTIONS.iconifyZoom;
        // Don't do anything if iconified did not change.
        if (this._iconified === iconified)
            return;
        this._iconified = iconified;

        // Replace polyline by markers, and vice-versa
        for (var k in this._objects) {
            var l = this._objects[k];
            l.iconified = iconified;

            if (!(l instanceof L.Polyline))
                return;  // Safety check.

            var departure = l.getLatLngs()[0],
                name = l.properties.name;

            // Remove trek departure, either clustered or departure flag
            if (l.marker) {
                this._trekCluster.removeLayer(l.marker);
                this._map.removeLayer(l.marker);
            }
            l.marker = this._getTrekMarker(departure, name, iconified);
            l.marker.trek = l;
            l.marker.on('click mouseover mouseout', function (e) {
                this.fire(e.type, L.Util.extend({layer: e.target.trek}, e));
            }, this);

            if (this._current_objects[k] === undefined)
                continue;

            if (iconified) {
                // Clean-up possible highlight
                if (this._hover) this._map.removeLayer(this._hover);
                // Remove line
                this._map.removeLayer(l);
                // Iconified : add to cluster
                this._trekCluster.addLayer(l.marker);
            }
            else {
                if (!this._map.hasLayer(l))
                    this._map.addLayer(l);
                // Not iconified : add departure flag to map
                this._map.addLayer(l.marker);
            }
        }
    },

    _getTrekMarker: function (latlng, name, iconified) {
        var marker = L.marker(latlng),
            icon = null,
            labelClassName = iconified ? 'trek' : 'departure';

        if (iconified) {
            icon = new L.DivIcon({
                className: 'trek-icon',
                labelAnchor: [15, 0]
            });
        }
        else {
            icon = new L.Icon({
                iconUrl: IMG_URL + '/marker-source.png',
                iconSize: [64, 64],
                iconAnchor: [32, 64],
                labelAnchor: [20, -50]
            });
        }
        marker.setIcon(icon);
        marker.bindLabel(name, {className: labelClassName});
        return marker;
    },

    _getTrekClusterIcon: function (cluster) {
        return new L.DivIcon({className: 'trek-cluster',
                              iconSize: [20, 20],
                              iconAnchor: [12, 12],
                              html: '<span class="count">' + cluster.getChildCount() + '</span>'});
    }
});


var POILayer = L.MarkerClusterGroup.extend({

    initialize: function (poisData) {
        L.MarkerClusterGroup.prototype.initialize.call(this, {
          showCoverageOnHover: false,
          disableClusteringAtZoom: 15,
          maxClusterRadius: 24,
          iconCreateFunction: function(cluster) {
              return new L.DivIcon({className: 'poi-marker-icon cluster',
                                    iconSize: [20, 20],
                                    iconAnchor: [12, 12],
                                    html: '<b>' + cluster.getChildCount() + '</b>'});
          }
        });

        for (var i=0; i < poisData.features.length; i++) {
            var featureData = poisData.features[i],
                marker = this.poisMarker(featureData,
                                         L.GeoJSON.coordsToLatLng(featureData.geometry.coordinates));
            this.addLayer(marker);
        }
    },

    poisMarker: function(featureData, latlng) {
        var img = L.Util.template('<img src="{SRC}" title="{TITLE}">', {
            SRC: featureData.properties.type.pictogram,
            TITLE: featureData.properties.type.label
        });

        var poicon = new L.DivIcon({className: 'poi-marker-icon',
                                    iconAnchor: [12, 12],
                                    labelAnchor: [12, 2],
                                    html: img}),
            marker = L.marker(latlng, {icon: poicon});

        // Label
        var category = featureData.properties.type.label,
            name = featureData.properties.name,
            poiLabel = category + ': ' + name;
        if (name.indexOf(category) === 0) {  // startswith
            poiLabel = name;
        }
        marker.bindLabel(poiLabel, {className: 'poi'});

        marker.properties = featureData.properties;

        return marker;
    }
});



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
    }
};

L.Map.include(FakeBoundsMapMixin);


L.Map.include({
    switchLayer: function (name) {
        // Requires layerscontrol
        if (!this.layerscontrol) return;

        var layers = this.layerscontrol._layers,
            selected = null;
        for (var id in layers) {
            var l = layers[id];
            if (l.name == name) {
                selected = l.layer;
                this.addLayer(l.layer);
            }
            else {
                if (this.hasLayer(l.layer))
                    this.removeLayer(l.layer);
            }
        }
        if (selected === null) throw "unknown layer " + name;
        this.fire('baselayerchange', {layer: selected});
    }
});



/**
 * Map initialization functions.
 * Callbacks of Django Leaflet.
 */
function mainmapInit(map, bounds) {
    map.attributionControl.setPrefix('');

    window.treksLayer = new TrekLayer(window.treks).addTo(map);

    if (!map.restoreView()) {
        var layerBounds = treksLayer.getBounds();
        map.fitFakeBounds(layerBounds.isValid() ? layerBounds : bounds);
    }

    // Move controls to the right
    map.zoomControl.setPosition('topright');
    L.control.fullscreen({
        position: 'topright',
        title: gettext('Fullscreen')
    }).addTo(map);

    map.addControl(new L.Control.Scale({imperial: false, position: 'bottomright'}));

    // Add reset view control
    map.whenReady(function () {
        map.switchLayer('main');
        if (map.layerscontrol) map.removeControl(map.layerscontrol);
        new L.Control.ResetView(treksLayer.getBounds(), {position: 'topright'}).addTo(map);
        $(window).trigger('map:ready', [map, 'main']);
    });

    // Highlight result on mouseover
    treksLayer.on('mouseover', function (e) {
      $('#trek-'+ e.layer.properties.pk +'.result').addClass('active');
    });
    treksLayer.on('mouseout', function (e) {
      $('#trek-'+ e.layer.properties.pk +'.result').removeClass('active');
    });

    //
    // Filter
    //
    // Reset view on filter reset
    $(window.trekFilter).on('reset', function (){
        map.fitFakeBounds(treksLayer.getBounds());
    });
    // Filter layers
    $(window.trekFilter).on("filterchange", function(e, matched) {
        treksLayer.updateFromPks(matched);
    });
    // In case filters iconified were loaded through URL, it's too late to
    // listen for filterchange event.
    if (window.trekFilter.matching.length > 0) {
        treksLayer.updateFromPks(window.trekFilter.matching);
    }

    // Filter list by map bounds
    map.on('moveend', function (e) {
        if (!map._loaded || MOBILE) return;  // Bounds should be set.

        $('#side-bar .result').removeClass('outbounds');
        if (!$(map._container).is(':visible')) {
            // If map is hidden (viewing detail page), consider all visible :)
            return;
        }
        var inBounds = treksLayer.search(map.getFakeBounds());
        $('#side-bar .result').addClass('outbounds');
        for (var i=0, n=inBounds.length; i<n; i++) {
            var pk = inBounds[i].properties.pk;
            $("#side-bar .result[data-id='" + pk + "']").removeClass('outbounds');
        }
    });

    // Go to detail page on double-click
    treksLayer.on('dblclick', function (e) {
        // Track event
        _gaq.push(['_trackEvent', 'Map', 'Doubleclick', e.layer.properties.name]);
        // Simulate click on link
        $('#trek-'+ e.layer.properties.pk +'.result a.pjax').click();
    });

    // Popup on click on trek
    var popup = null;
    treksLayer.on('click', function (e) {
        var layer = e.layer;

        // Safety check. Should never happen.
        if (!layer.properties || !layer.properties.pk) {
            console.warn('Trek layer has no properties. ' + L.Util.stamp(layer));
            return;
        }

        var html = '<h3>{NAME}</h3>' +
                   '<div class="clearfix">' +
                   '  <a href="{LINK}" class="pjax"><img src="{THUMBNAIL}"/></a>'+
                   '  <div class="description">{DESCRIPTION}</div>' +
                   '  <p class="popupdetail"><a href="{LINK}" class="pjax">{MORE}</a></p>' +
                   '</div>' +
                   '<i class="icon-chevron-right icon"></i>';
        html = L.Util.template(html, {
            NAME: layer.properties.name,
            DESCRIPTION: layer.properties.description_teaser,
            // This is tricky : use img url of trek in result list :)
            THUMBNAIL: $('#trek-'+ e.layer.properties.pk +'.result img').attr('src'),
            LINK: $('#trek-'+ e.layer.properties.pk +'.result a.pjax').attr('href'),
            MORE: gettext("More info...")
        });

        if (popup) {
            // Click on already opened popup : close only.
            var same = (popup.pk == layer.properties.pk);
            popup._close();
            if (same)
                return;
        }

        var popupSettings = {
            autoPan: true,
        };

        if(MOBILE) {
            popupSettings = L.Util.extend(popupSettings, {
                closeButton: false,
                maxWidth: 250,
                autoPanPadding: new L.Point(5, 50)
            });
        }

        popup = L.popup(popupSettings).setLatLng(e.latlng)
                 .setContent(html)
                 .openOn(map);
        popup.pk = layer.properties.pk;

        // Make sure clic on details will open as pjax (cause added after initial loading?)
        $("a.pjax", popup._container).click(function (event) {
            $.pjax.click(event, {container: '#content'});

            // Track event
            _gaq.push(['_trackEvent', 'Map', 'Popup', e.layer.properties.name]);
        });

        // If MOBILE, then click on whole popup panel opens details
        if(MOBILE) {
            $(".leaflet-popup-content-wrapper").on('click', function (event) {
                $.pjax({container: '#content', url:$("a.pjax", popup._container).attr('href')});
            });
        }
    });
    // If popup is closed on map click (since closeOnClick is default option)
    // then clean popup reference to have clear iconified for next trek click
    map.on('layerremove', function (e) {
        if (e.layer === popup)
            popup = null;
    });
}


function detailmapInit(map, bounds) {
    map.attributionControl.setPrefix('');
    L.control.fullscreen({
        position: 'topright',
        title: gettext('Fullscreen')
    }).addTo(map);

    // Minimize minimap by default
    map.on('viewreset', function () {
        map.minimapcontrol._minimize();
    });

    $('#pois-accordion .accordion-body').on('show', function (e) {
        var id = $(e.target).data('id'),
            marker = window.poisMarkers[id];

        // Prevent double-jump
        if (marker._animating === true)
            return;

        map.panTo(marker.getLatLng());

        // Add clusterized marker explicitly, will be removed on accordion close.
        marker._clusterized = (marker._map === undefined);
        if (marker._clusterized) {
            map.addLayer(marker);
        }
        // Jump!
        marker._animating = true;
        $(marker._icon).addClass('highlight');
        marker.openPopup();
        $(marker._icon).css('z-index', 3000);
        $(marker._icon).animate({"margin-top": "-=20px"}, "fast",
                                function(){
                                    marker._animating = false;
                                    $(this).animate({"margin-top": "+=20px"}, "fast");
                                });
    });

    $('#pois-accordion .accordion-body').on('hidden', function (e) {
        var id = $(e.target).data('id'),
            marker = window.poisMarkers[id];

        $(marker._icon).removeClass('highlight');
        marker.closePopup();
        // Restore clusterized markers (if still on map, i.e. zoom not changed)
        if (marker._clusterized && marker._map) {
            marker._map.removeLayer(marker);
            marker._map = undefined;
        }
    });


    // Trek
    var highlight = new L.GeoJSON(window.trek.geometry, {style: L.extend(TREK_LAYER_OPTIONS.outlinestyle, {clickable: false})})
                         .addTo(map);
    window.trekLayer = new L.GeoJSON(window.trek.geometry, {style: L.extend(TREK_LAYER_OPTIONS.hoverstyle, {clickable: false})})
                            .addTo(map);

    var wholeBounds = trekLayer.getBounds();

    // Show start and end
    trekLayer.eachLayer(function (layer) {
        if (layer instanceof L.MultiPolyline)
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

        if (!/^\s*$/.test(window.trek.properties.departure)) {
            departureLabel += (": " + window.trek.properties.departure);
        }
        if (!/^\s*$/.test(window.trek.properties.arrival)) {
            arrivalLabel += (": " + window.trek.properties.arrival);
        }

        L.marker(layer.getLatLngs()[0],
                 {icon: new L.Icon({
                                iconUrl: IMG_URL + '/marker-source.png',
                                iconSize: [64, 64],
                                iconAnchor: [32, 64],
                                labelAnchor: [20, -50]
                    })
                 })
          .bindLabel(departureLabel, {className: 'departure'})
          .addTo(map);
        L.marker(layer.getLatLngs().slice(-1)[0],
                 {icon: new L.Icon({
                                iconUrl: IMG_URL + '/marker-target.png',
                                iconSize: [64, 64],
                                iconAnchor: [32, 64],
                                labelAnchor: [-3, -50]
                 })})
          .bindLabel(arrivalLabel, {className: 'arrival'})
          .addTo(map);
    });

    // POIs Layer
    var poisLayer = new POILayer(pois);
    poisLayer.eachLayer(function (marker) {
        wholeBounds.extend(marker.getLatLng());
        window.poisMarkers[marker.properties.pk] = marker;
        /*
         * Open Accordion on marker click.
         * TODO: does not work correctly.
         */
        marker.off('click');  // Disable auto-control of popup
        marker.on('click', function (e) {
            var $item = $('#poi-item-' + marker.properties.pk);
            $item.click();
            var top = $('#pois-accordion').scrollTop(),
                toTop = $item.position().top;
            $('#pois-accordion').animate({
                scrollTop: top + toTop
            }, 1000);
        });

    });
    poisLayer.addTo(map);

    var parkingIcon = L.icon({
        iconUrl: IMG_URL + '/parking.png',
        iconSize: [24, 24],
        iconAnchor: [0, 0],
        labelAnchor: [20, 12]
    });
    var parkingLocation = trek.properties.parking_location;
    if (parkingLocation) {
        var pos = L.latLng([parkingLocation[1], parkingLocation[0]]);
        L.marker(pos, {icon: parkingIcon})
         .bindLabel(trek.properties.advised_parking || gettext("Recommended parking"), {className: 'parking'})
         .addTo(map);
        wholeBounds.extend(pos);
    }

    map.fitBounds(wholeBounds);

    var marker = null;
    $('#profilealtitude').on('hover:distance', function (event, meters) {
        if (marker) {
            map.removeLayer(marker);
            marker = null;
        }
        if (meters === null)
            return;
        trekLayer.eachLayer(function (layer) {
            if (layer instanceof L.MultiPolyline)
                return;
            var latLng = latLngAtDistance(layer, meters);
            if (latLng) {
                marker = L.circleMarker(latLng, TREK_LAYER_OPTIONS.positionstyle).setRadius(5).addTo(map);
            }
        });
    });


    // Add reset view control
    map.whenReady(function () {
        map.switchLayer('detail');
        if (map.layerscontrol) map.removeControl(map.layerscontrol);

        new L.Control.ResetView(wholeBounds, {position: 'topright'}).addTo(map);
        map.addControl(new L.Control.Scale({imperial: false, position: 'bottomright'}));

        map.scrollWheelZoom.disable();
        var enableWheel = function () {
            map.scrollWheelZoom.enable();
            $(map._container).css('cursor','-moz-grab');
            $(map._container).css('cursor','-webkit-grab');
            $('.helpclic').hide();
        };

        $(map._container).css('cursor','pointer');

        // Enable wheel zoom on clic (~ focus)
        map.on('click', enableWheel);

        $(window).trigger('map:ready', [map, 'detail']);
    });
}

function distanceMeters(p1, p2) {
  var R = 6371000,
      dLat = toRad(p2.lat - p1.lat),
      dLon = toRad(p2.lng - p1.lng);
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(toRad(p2.lat)) * Math.cos(toRad(p2.lat)) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a) , Math.sqrt(1-a));
  var d = R * c;

  function toRad(n) { return n * Math.PI / 180; }
  return d;
}

function latLngAtDistance(polyline, distance) {
  // Initialization of variables
  var points = polyline.getLatLngs(),
      distance_cum = 0.0;
  //iterate line points
  for (var i=1; i<points.length; i++) {
    var p1 = points[i-1],
        p2 = points[i];
    distance_cum = distance_cum + distanceMeters(p1, p2); //calcul distance
    if (distance_cum >= distance) {
        return L.latLng(p2.lat, p2.lng);
    }
  }
  return null;
}
