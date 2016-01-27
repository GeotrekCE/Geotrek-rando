'use strict';

function leafletExtend() {

    /*
     * L.Control.SwitchBackgroundLayers is a control to allow users to switch between different main layers on the map.
     */
    L.Control.SwitchBackgroundLayers = L.Control.extend({
        options: {
            position: 'bottomleft'
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
            autoZIndex: true,
            defaultIcon: 'data:image/svg+xml;base64,PHN2ZyB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOmNjPSJodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9ucyMiIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyIgeG1sbnM6c3ZnPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczpzb2RpcG9kaT0iaHR0cDovL3NvZGlwb2RpLnNvdXJjZWZvcmdlLm5ldC9EVEQvc29kaXBvZGktMC5kdGQiIHhtbG5zOmlua3NjYXBlPSJodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy9uYW1lc3BhY2VzL2lua3NjYXBlIiB2ZXJzaW9uPSIxLjEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCwtOTUyLjM2MjE4KSI+PHBhdGggc3R5bGU9IiIgZD0iTSA0OS45OTk5OTUsOTY5LjAyODg3IDkuOTk5OTk4LDk4OS4wMjg4OCA0OS45OTk5OTUsMTAwOS4wMjg5IDkwLjAwMDAwMiw5ODkuMDI4ODggNDkuOTk5OTk1LDk2OS4wMjg4NyB6IG0gLTMwLjAwMDAwMiwyOC4zMzMzNCAtOS45OTk5OTUsNC45OTk5OSAzOS45OTk5OTcsMjAgNDAuMDAwMDA3LC0yMCAtMTAsLTQuOTk5OTkgLTMwLjAwMDAwNywxNC45OTk5OSAtMzAuMDAwMDAyLC0xNC45OTk5OSB6IG0gMCwxMy4zMzMyOSAtOS45OTk5OTUsNSAzOS45OTk5OTcsMjAgNDAuMDAwMDA3LC0yMCAtMTAsLTUgLTMwLjAwMDAwNywxNS4wMDAxIC0zMC4wMDAwMDIsLTE1LjAwMDEgeiIgZmlsbD0iIzAwMDAwMCIvPjwvZz48L3N2Zz4='
        },

        initialize: function (baseLayers, options) {
            L.setOptions(this, options);

            this._layers = {};
            this._lastZIndex = 0;

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
            L.DomEvent.disableClickPropagation(this._container);
            return this._container;
        },

        _addItem: function (obj) {
            if (obj.layer && obj.layer.options && obj.layer.options.force) {
                this._map.addLayer(obj.layer);
                return false;
            }

            var control   = document.createElement('a'),
                icon      = this.options.defaultIcon,
                container = this._container;

            if (obj.layer.options && obj.layer.options.icon) {
                icon = obj.layer.options.icon;
            }

            if (obj.layer.options && obj.layer.options.legend) {
                control.setAttribute('title', obj.layer.options.legend);
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

            if (this.options.autoZIndex && layer.setZIndex) {
                this._lastZIndex++;
                layer.setZIndex(this._lastZIndex);
            }
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
