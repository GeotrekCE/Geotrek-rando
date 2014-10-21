var TrekLayer = L.GeoJSON.extend({
    includes: L.LayerIndexMixin,

    initialize: function (options) {
        options = L.Util.extend(TREK_LAYER_OPTIONS, options || {});
        L.GeoJSON.prototype.initialize.call(this, null, options);

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
        L.GeoJSON.prototype.onAdd.apply(this, arguments);
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
        L.GeoJSON.prototype.onRemove.apply(this, arguments);
    },

    addLayer: function (layer) {
        if (layer.iconified) {
            this._trekCluster.addLayer(layer.marker);
            return;
        }
        else if (layer.marker && this._map) {
            this._map.addLayer(layer.marker);
        }
        return L.GeoJSON.prototype.addLayer.call(this, layer);
    },

    removeLayer: function (layer) {
        if (layer.marker && this._map) {
            this._trekCluster.removeLayer(layer.marker);
            this._map.removeLayer(layer.marker);
        }
        return L.GeoJSON.prototype.removeLayer.call(this, layer);
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


/**
 * Map initialization functions.
 * Callbacks of Django Leaflet.
 */
function mainmapSetup(map, app) {
    var treksLayer = app.trekLayer.addTo(map);

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
        treksLayer.showOnly(app.trekCollection.pluck("id"));
        map.fitFakeBounds(treksLayer.getFullBounds());
    });

    // Filter list by map bounds
    map.on('moveend', function (e) {
        if (!map._loaded || Rando.MOBILE) return;  // Bounds should be set.

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

        if(Rando.MOBILE) {
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
        if(Rando.MOBILE) {
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
