(function (window) {
    'use strict';

    L.Control.TourismLayers = L.Control.extend({
        includes: L.Mixin.Events,
        options: {
            position: 'topleft',
        },

        initialize: function (definitions) {
            this.definitions = definitions;
            this.layers = [];
        },

        onAdd: function(map) {
            this.map = map;
            this._container = L.DomUtil.create('div');

            for (var i=0, n=this.definitions.length; i<n; i++) {
                var def = this.definitions[i];
                var layer = new L.GeoJSON.AJAX('files' + def.geojson_url);
                this.layers.push(layer);
                layer.addTo(map);
            }
            return this._container;
        }
    });


    $(window).on('map:init', function (e) {
        var data = e.originalEvent.detail,
            map = data.map;
        $.getJSON('/fr/files/api/datasource/datasources.json', function (data) {
            var control = map.tourismLayers = new L.Control.TourismLayers(data);
            control.addTo(map);
        });
    });
})(window);