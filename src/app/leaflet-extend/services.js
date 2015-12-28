'use strict';

function leafletExtend() {

    /*
     * L.Control.SwitchBackgroundLayers is a control to allow users to switch between different main layers on the map.
     */
    L.Control.SwitchBackgroundLayers = L.Control.extend({
        options: {
            position: 'bottomleft',
        },

        initialize: function (baseLayers, options) {
            L.setOptions(this, options);

            this._layers = {};

            for (var i in baseLayers) {
                if (this.i !== 0) {
                    this._addLayer(baseLayers[i], i);
                }
            }

        },

        onAdd: function (map) {

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
                this._toggleLayer();
            }, this);


            return this._container;
        },

        _toggleLayer: function () {

            if (this._map.isShowingLayer('main') || this._map.isShowingLayer('detail')) {
                this._map.switchLayer('satellite');

                L.DomUtil.removeClass(this.button, 'satellite');
                L.DomUtil.addClass(this.button, 'main');
            } else {
                this._map.switchLayer(this._map.getZoom() > this.switch_detail_zoom ? 'detail' : 'main');

                L.DomUtil.removeClass(this.button, 'main');
                L.DomUtil.addClass(this.button, 'satellite');
            }
        },

        _addLayer: function (layer, name) {
            var id = L.stamp(layer);

            this._layers[id] = {
                layer: layer,
                name: name
            };
        }

    });

    L.control.switchBackgroundLayers = function (baseLayers, options) {
        return new L.Control.SwitchBackgroundLayers(baseLayers, options);
    };




    /*
     * L.Control.BackgroundLayers is a control to allow users to use custom image for layers control.
     */

    L.Control.BackgroundLayers = L.Control.extend({
        options: {
            position: 'topright',
            groupLayers: false,
            defaultIcon: 'app/vendors/images/leaflet-backgroundlayers/layers.svg'
        },

        initialize: function (baseLayers, options) {
            L.setOptions(this, options);

            this._layers = {};
            if (!this.options.groupLayers) {
                for (var i in baseLayers) {
                    if (this.i !== 0) {
                        this._addLayer(baseLayers[i], i);
                    }
                }
            } else {
                this._addLayer(baseLayers);
            }
        },

        onAdd: function () {
            var className = 'background-layer-switcher';
            this._container = L.DomUtil.create('div', className);

            var obj = this._layers;
            for (var i in this._layers) {
                if (this.i !== 0) {
                    obj = this._layers[i];
                    this._addItem(obj);
                }
            }
            return this._container;
        },

        _addItem: function (obj) {
            var control = document.createElement('a'),
                icon = this.options.defaultIcon;

            if (typeof obj.layer.options !== 'undefined') {
                if (typeof obj.layer.options.icon !== 'undefined') {
                    icon = obj.layer.options.icon;
                }
            }
            control.layerId = L.stamp(obj.layer);

            L.DomEvent.on(control, 'click', function() {
                if (!this._map.hasLayer(obj.layer)) {
                    this._map.addLayer(obj.layer);
                } else if (this._map.hasLayer(obj.layer)) {
                    this._map.removeLayer(obj.layer);
                }
                control.className = 'background ' + this._getState(obj.layer);
            }, this);

            control.className = 'background ' + this._getState(obj.layer);
            control.innerHTML = '<img src="' + icon + '" alt="" />';

            var container = this._container;
            container.appendChild(control);
        },

        removeLayer: function (layer) {
            var id = L.stamp(layer);
            delete this._layers[id];
            return this;
        },

        _getState: function (layer) {
            return this._map.hasLayer(layer) ? 'active' : '';
        },

        _addLayer: function (layer, name) {
            var id = L.stamp(layer);

            this._layers[id] = {
                layer: layer,
                name: name
            };
        }
    });

    L.control.backgroundLayers = function (baseLayers, options) {
        return new L.Control.BackgroundLayers(baseLayers, options);
    };
}


leafletExtend();

module.exports = {
    leafletExtend: leafletExtend
};
