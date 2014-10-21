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

        return this.setView(point, this._zoom, { pan: options });
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
