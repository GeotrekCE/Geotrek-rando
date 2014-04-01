(function (window) {
    'use strict';

    L.Control.TourismLayers = L.Control.extend({
        includes: L.Mixin.Events,
        options: {
            position: 'bottomleft',
        },

        initialize: function (base_url, definitions) {
            this.base_url = base_url;
            this.definitions = definitions;
            this.layers = [];
        },

        onAdd: function(map) {
            this.map = map;
            this._container = L.DomUtil.create('div', 'tourism-layer-switcher');

            for (var i=0, n=this.definitions.length; i<n; i++) {
                this._addTourismLayer(this.definitions[i]);
            }
            return this._container;
        },

        _addTourismLayer: function (definition) {
            var layer = new L.GeoJSON.AJAX(this.base_url + definition.geojson_url, {
                pointToLayer: this._buildMarker.bind(this)
            });

            var className = 'toggle-layer ' + definition.id;

            var button = L.DomUtil.create('a', className, this._container);
            button.setAttribute('title', definition.title);
            button.innerHTML = L.Util.template('<img alt="{title}" src="{pictogram_url}"/>',
                                               definition);

            L.DomEvent.disableClickPropagation(button);
            L.DomEvent.on(button, 'click', function (e) {
                this.toggleLayer(button, layer);
            }, this);
            this.layers.push(layer);
        },

        toggleLayer: function (button, layer) {
            if (this.map.hasLayer(layer)) {
                L.DomUtil.removeClass(button, 'active');
                this.map.removeLayer(layer);
            }
            else {
                L.DomUtil.addClass(button, 'active');
                this.map.addLayer(layer);
            }
        },

        _buildMarker: function (feature, latlng) {
            var html = L.Util.template('<div class="tourism"></div>');
            var icon = L.divIcon({className: 'tourism',
                                  html: html});
            var marker = L.marker(latlng, {icon: icon});
            return marker;
        }
    });

    var $script_tag = $('script#tourism'),
        datasources_url = $script_tag.data('datasources-url'),
        base_url = $script_tag.data('base-url');

    $(window).on('map:init', function (e) {
        var data = e.detail || e.originalEvent.detail,
            map = data.map;
        $.getJSON(datasources_url, function (data) {
            var control = map.tourismLayers = new L.Control.TourismLayers(base_url, data);
            control.addTo(map);

            $('a', control._container).tooltip();
        });
    });
})(window);