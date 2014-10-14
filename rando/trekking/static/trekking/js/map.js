var TrekLayer = L.GeoJSON.AJAX.extend({
    includes: L.LayerIndexMixin,

    initialize: function (url) {
        var options = L.Util.extend(TREK_LAYER_OPTIONS, {});
        L.GeoJSON.AJAX.prototype.initialize.call(this, url, options);

        this.on('mouseover mouseout', function (e) {
            this.highlight(e.layer, e.type == 'mouseover');
        }, this);

        var clusterOptions = L.Util.extend(TREK_LAYER_OPTIONS.clusterOptions, {
            iconCreateFunction: this._getTrekClusterIcon.bind(this)
        });
        this._trekCluster = new L.MarkerClusterGroup(clusterOptions);

        this._allTreks = [];
        this._filtered = {};
        this._hover = null;
        this._iconified = null;
        this._fullBounds = null;

        this.on('data:loaded', function (e) {
            this._fullBounds = this.getBounds();
            var allLayers = this.getLayers();
            for (var i=0; i<allLayers.length; i++) {
                var layer = allLayers[i];
                this._allTreks.push(layer);
                this.indexLayer(layer);
            }
        }, this);
    },

    showOnly: function (treksIds) {
        for (var i=0; i<this._allTreks.length; i++) {
            var layer = this._allTreks[i],
                trekId = layer.feature.id,
                isFiltered = !!this._filtered[trekId];
            if (treksIds.indexOf(trekId) > -1) {
                // Should be added, if not already
                if (isFiltered) {
                    this.addLayer(layer);
                    delete this._filtered[trekId];
                }
            }
            else {
                // Should be filtered, if not already
                if (!isFiltered) {
                    this._filtered[trekId] = layer;
                    this.removeLayer(layer);
                }
            }
        }
    },

    getFullBounds: function () {
        // Returns the full bounds of all treks, ignoring the current state
        // of the layers (clustered, iconified, etc.)
        return this._fullBounds;
    },

    getLayer: function (trekId) {
        for(var i=0; i<this._allTreks.length; i++) {
            var layer = this._allTreks[i],
                id = layer.feature.id || layer.feature.properties.pk;
            if (id == trekId)
                return layer;
        }
        return null;
    },

    highlight: function (layer, on) {
        if (/string|number/.test(typeof(layer))) {
            layer = this.getLayer(layer);
        }
        if (!layer) return;
        if (!this._map) return;

        on = on === undefined ? true : on;
        var isNotClustered = layer.marker && layer.marker._icon;
        if (on) {
            if (layer.iconified) {
                if (isNotClustered)
                    L.DomUtil.addClass(layer.marker._icon, 'highlight');
                return;
            }

            this._hover = new L.Polyline(layer.getLatLngs());
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
                if (isNotClustered)
                    L.DomUtil.removeClass(layer.marker._icon, 'highlight');
            }
            else {
                if (this._hover) this._map.removeLayer(this._hover);
                layer.setStyle(TREK_LAYER_OPTIONS.style);
            }
        }
    },

    onAdd: function (map) {
        /* When layer is added on map.
         */
        L.GeoJSON.AJAX.prototype.onAdd.apply(this, arguments);
        this.on('data:loaded', function () {
            map.on('zoomend', this._iconifyTreks, this);
            this._iconifyTreks();
        }, this);
        this._trekCluster.addTo(map);
    },

    onRemove: function () {
        /* When layer is removed from the map.
         */
        this._map.removeLayer(this._trekCluster);
        map.off('zoomend', this._iconifyTreks, this);
        L.GeoJSON.AJAX.prototype.onRemove.apply(this, arguments);
    },

    addLayer: function (layer) {
        if (layer.iconified) {
            this._trekCluster.addLayer(layer.marker);
            return;
        }
        else if (layer.marker && this._map) {
            this._map.addLayer(layer.marker);
        }
        return L.GeoJSON.AJAX.prototype.addLayer.call(this, layer);
    },

    removeLayer: function (layer) {
        if (layer.marker && this._map) {
            this._trekCluster.removeLayer(layer.marker);
            this._map.removeLayer(layer.marker);
        }
        return L.GeoJSON.AJAX.prototype.removeLayer.call(this, layer);
    },

    _iconifyTreks: function (e) {
        var zoom = this._map.getZoom(),
            iconified = zoom < TREK_LAYER_OPTIONS.iconifyZoom;
        // Don't do anything if iconified did not change.
        if (this._iconified === iconified)
            return;
        this._iconified = iconified;

        // Replace polyline by markers, and vice-versa
        for (var i=0; i<this._allTreks.length; i++) {
            var l = this._allTreks[i];
            l.iconified = iconified;

            var trekId = l.feature.id;

            var departure = l.getLatLngs()[0],
                name = l.feature.properties.name;

            // Remove trek departure, either clustered or departure flag
            if (l.marker) {
                this._trekCluster.removeLayer(l.marker);
                this._map.removeLayer(l.marker);
            }
            l.marker = this._getTrekMarker(departure, name, iconified);
            l.marker.trek = l;
            l.marker.on('click mouseover mouseout', propagate_mouse_event, this);

            if (this._filtered[trekId] !== undefined) {
                continue;  // Skip currently filtered
            }

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


        function propagate_mouse_event(e) {
            this.fire(e.type, L.Util.extend({layer: e.target.trek}, e));
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
        var size = TREK_LAYER_OPTIONS.icons.cluster.size;
        return new L.DivIcon({className: 'trek-cluster',
                              iconSize: [size, size],
                              iconAnchor: [size/2 + 2, size/2 + 2],
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
                var icons = {ICON1: '&nbsp;', ICON2: '&nbsp;',
                             ICON3: '&nbsp;', ICON4: '&nbsp;'};
                var tableTmpl = '' +
                '<div class="pois-cluster-row"><div class="pois-cluster-cell">{ICON0}</div><div class="pois-cluster-cell">{ICON1}</div></div>' +
                '<div class="pois-cluster-row"><div class="pois-cluster-cell">{ICON2}</div><div class="pois-cluster-cell">{ICON3}</div></div>' +
                '';
                var children = cluster.getAllChildMarkers();
                for (var i=0; i<Math.min(children.length, 4); i++) {
                    var c = children[i];
                    icons['ICON'+i] = '<img src="' + c.properties.type.pictogram + '"/>';
                }
                var size = DETAIL_MAP_OPTIONS.icons.cluster.size;
                var iconsTable = L.Util.template(tableTmpl, icons);
                return new L.DivIcon({className: 'poi-marker-icon cluster',
                                      iconSize: [size, size],
                                      iconAnchor: [size/2, size/2],
                                      html: iconsTable});
          }
        });

        if (poisData) {
            this.addData(poisData);
        }
    },

    addData: function (poisData) {
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
        var size = DETAIL_MAP_OPTIONS.icons.poi.size;
        var poicon = new L.DivIcon({className: 'poi-marker-icon',
                                    iconSize: [size, size],
                                    iconAnchor: [size/2, size/2],
                                    labelAnchor: [size/2, 2],
                                    html: img}),
            marker = L.marker(latlng, {icon: poicon, riseOnHover: true});

        // Label
        var category = featureData.properties.type.label,
            name = featureData.properties.name,
            poiLabel = category + '&nbsp;: ' + name;
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


var LayerSwitcherMixin = {

    isShowingLayer: function (name) {
        // Requires layerscontrol
        if (!this.layerscontrol) return;

        var layers = this.layerscontrol._layers;
        for (var id in layers) {
            var l = layers[id];
            if (l.name == name && this.hasLayer(l.layer)) {
                return true;
            }
        }
        return false;
    },

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
};

L.Map.include(LayerSwitcherMixin);


L.LatLngBounds.prototype.padTop = function (bufferRatio) {
    var sw = this._southWest,
        ne = this._northEast,
        heightBuffer = Math.abs(sw.lat - ne.lat) * bufferRatio;

    return new L.LatLngBounds(
            new L.LatLng(sw.lat, sw.lng),
            new L.LatLng(ne.lat + heightBuffer, ne.lng));

};

L.Control.SwitchBackgroundLayers = L.Control.extend({
    options: {
        position: 'bottomleft',
    },

    onAdd: function(map) {
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
        this.button.setAttribute('title', gettext('Show satellite'));
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
            this.button.setAttribute('title', gettext('Show plan'));
        }
        else {
            this.map.switchLayer(this.map.getZoom() > this.switch_detail_zoom ?
                                 'detail' : 'main');

            L.DomUtil.removeClass(this.button, 'main');
            L.DomUtil.addClass(this.button, 'satellite');
            this.button.setAttribute('title', gettext('Show satellite'));
        }

        $(this.button).tooltip('destroy');
        $(this.button).tooltip({placement: 'right',
                                container: this.map._container});
    }

});


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


$(window).on('map:init', function (e) {
    var data = e.detail || e.originalEvent.detail,
        map = data.map;
    var control = new L.Control.SwitchBackgroundLayers();
    control.addTo(map);
});

/**
 * Map initialization functions.
 * Callbacks of Django Leaflet.
 */
function mainmapInit(map, djoptions) {
    map.attributionControl.setPrefix('');

    var treks_url = $(map._container).data('treks-url'),
        treks_extent = $(map._container).data('treks-extent');

    var treksLayer = (new TrekLayer(treks_url)).addTo(map);

    var treksBounds = L.latLngBounds([treks_extent[3],
                                      treks_extent[0]],
                                     [treks_extent[1],
                                      treks_extent[2]]);
    if (!map.restoreView()) {
        map.fitFakeBounds(treksBounds);
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
        if (map.layerscontrol) map.removeControl(map.layerscontrol);
        new L.Control.ResetView(treksLayer.getFullBounds.bind(treksLayer), {position: 'topright'}).addTo(map);
        $(window).trigger('map:ready', [map, 'main']);
    });

    // Reduce minimap offset
    map.minimapcontrol.options.zoomLevelOffset = -3;

    // Highlight result on mouseover
    treksLayer.on('mouseover', function (e) {
      $('#trek-'+ e.layer.feature.properties.pk +'.result').addClass('active');
    });
    treksLayer.on('mouseout', function (e) {
      $('#trek-'+ e.layer.feature.properties.pk +'.result').removeClass('active');
    });

    $(window).on('view:leave', function (e) {
        // Deselect all treks on page leave
        treksLayer.eachLayer(function (l) {
            treksLayer.highlight(l.feature.properties.pk, false);
        });
    });
    $(window).on('trek:highlight', function (e, trek_id, state) {
        treksLayer.highlight(trek_id, state);
    });

    //
    // Filter
    //
    // Reset view on filter reset
    $(window).on('filters:clear', function (){
        map.fitFakeBounds(treksBounds);
    });
    // Filter layers
    $(window).on("filters:changed", function(e, matched) {
        treksLayer.showOnly(matched);
    });
    treksLayer.on('data:loaded', function () {
        if (window.trekFilter.matching.length > 0) {
            treksLayer.showOnly(window.trekFilter.matching);
        }
        map.fitFakeBounds(treksLayer.getFullBounds());
    });

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
            var pk = inBounds[i].feature.properties.pk;
            $("#side-bar .result[data-id='" + pk + "']").removeClass('outbounds');
        }
    });

    // Go to detail page on double-click
    treksLayer.on('dblclick', function (e) {
        // Track event
        _gaq.push(['_trackEvent', 'Map', 'Doubleclick', e.layer.feature.properties.name]);
        // Simulate click on link
        $('#trek-'+ e.layer.feature.properties.pk +'.result a.pjax').click();
    });

    // Popup on click on trek
    var popup = null;
    treksLayer.on('click', function (e) {
        var layer = e.layer;

        // Safety check. Should never happen.
        if (!layer.feature.properties || !layer.feature.id) {
            console.warn('Trek layer has no properties. ' + L.Util.stamp(layer));
            return;
        }

        var properties = layer.feature.properties;

        var html = '<h3>{NAME}</h3>' +
                   '<div class="clearfix icon-right-open-mini">' +
                   '  <a href="{LINK}" class="pjax"><img src="{THUMBNAIL}"/></a>'+
                   '  <div class="description">{DESCRIPTION}</div>' +
                   '  <p class="popupdetail"><a href="{LINK}" class="icon-binocular pjax">{MORE}</a></p>' +
                   '</div>';
        html = L.Util.template(html, {
            NAME: properties.name,
            DESCRIPTION: properties.description_teaser,
            // This is tricky : use img url of trek in result list :)
            THUMBNAIL: $('#trek-'+ properties.pk +'.result img').attr('src'),
            LINK: $('#trek-'+ properties.pk +'.result a.pjax').attr('href'),
            MORE: gettext("More info...")
        });

        if (popup) {
            // Click on already opened popup : close only.
            var same = (popup.pk == properties.pk);
            popup._close();
            if (same)
                return;
        }

        var popupSettings = {
            autoPan: true,
            offset: layer.iconified ? new L.Point(2, -10) : new L.Point(2, 0) // different offset depending on iconified state
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
        popup.pk = properties.pk;

        // Make sure clic on details will open as pjax (cause added after initial loading?)
        $("a.pjax", popup._container).click(function (event) {
            $.pjax.click(event, {container: '#pjax-content'});

            // Track event
            _gaq.push(['_trackEvent', 'Map', 'Popup', properties.name]);
        });

        // If MOBILE, then click on whole popup panel opens details
        if(MOBILE) {
            $(".leaflet-popup-content-wrapper").on('click', function (event) {
                $.pjax({container: '#pjax-content', url:$("a.pjax", popup._container).attr('href')});
            });
        }
    });
    // If popup is closed on map click (since closeOnClick is default option)
    // then clean popup reference to have clear iconified for next trek click
    map.on('layerremove', function (e) {
        if (e.layer === popup)
            popup = null;
    });

    $(window).on('trek:showpopup', function (e, trek_id) {
        // Grab a reference on layer with same id
        var trekOnMap = treksLayer.getLayer(trek_id);
        if (trekOnMap) {
            var coords = trekOnMap.getLatLngs(),
                departure = coords[0],
                middlepoint = coords[Math.round(coords.length/2)],
                clickpoint = trekOnMap.iconified ? departure : middlepoint;
            trekOnMap.fire('click', {
              latlng: clickpoint
            });
            // Move the map if trek is below search results
            var isNotClustered = trekOnMap.marker && trekOnMap.marker._icon;
            if (isNotClustered)
                map.fakePanTo(clickpoint);
        }
        else {
          console.warn("Trek not on map: " + trek_id);
        }
    });
}


function detailmapInit(map, bounds) {
    map.attributionControl.setPrefix('');
    L.control.fullscreen({
        position: 'topright',
        title: gettext('Fullscreen')
    }).addTo(map);

    var trekGeoJson = JSON.parse(document.getElementById('trek-geojson').innerHTML);
    var poiUrl = $(map._container).data('poi-url');
    var informationDeskUrl = $(map._container).data('information-desk-url');

    var trekLayer = initDetailTrekMap(map, trekGeoJson);
    var parking = initDetailParking(map, trekGeoJson);
    initDetailPointsReference(map, trekGeoJson);
    initDetailAltimetricProfile(map, trekLayer);

    var wholeBounds = trekLayer.getBounds().padTop(0.12);
    if (parking) {
        wholeBounds.extend(parking.getLatLng());
    }
    map.fitBounds(wholeBounds);

    var poisLayer = initDetailPoisLayer(map, poiUrl);
    poisLayer.on('data:loaded', function () {
        wholeBounds.extend(poisLayer.getBounds());
    });

    initPOIsList(map);

    var informationDesksLayer = initDetailInformationDesksLayer(map, informationDeskUrl);
    informationDesksLayer.on('data:loaded', function () {
        wholeBounds.extend(informationDesksLayer.getBounds());
    });

    var poisLayerSwitcher = new L.Control.TogglePOILayer(poisLayer);
    poisLayerSwitcher.addTo(map);
    map.poisLayerSwitcher = poisLayerSwitcher;

    map.whenReady(function () {
        map.switchLayer('detail');
        if (map.layerscontrol) map.removeControl(map.layerscontrol);

        // Minimize minimap by default
        map.minimapcontrol._minimize();

        new L.Control.ResetView(getWholeBounds, {position: 'topright'}).addTo(map);
        map.addControl(new L.Control.Scale({imperial: false, position: 'bottomright'}));

        map.scrollWheelZoom.disable();
        var enableWheel = function () {
            map.scrollWheelZoom.enable();
            $(map._container).css('cursor','-moz-grab');
            $(map._container).css('cursor','-webkit-grab');
            $(map._container).addClass('enabled');
            $('.helpclic').hide();
        };

        $(map._container).css('cursor','pointer');

        // Enable wheel zoom on clic (~ focus)
        map.on('click', enableWheel);

        $(window).trigger('map:ready', [map, 'detail']);
    });

    function getWholeBounds() {
        return wholeBounds;
    }
}


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

function initDetailAltimetricProfile(map, trekLayer) {
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
    if (L.DomUtil.get('pois-sidebar')) {
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
            
            if($('#pois-sidebar').hasClass('default-opened'))
                poiSidebar.show();
            else
                map.poisLayerSwitcher.toggleLayer();

            var $sidebar = $('#pois-sidebar');

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

    }
}
