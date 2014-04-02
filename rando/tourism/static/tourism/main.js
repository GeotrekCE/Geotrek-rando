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
                pointToLayer: (function (feature, latlng) {
                    return this._buildMarker(definition, feature, latlng);
                }).bind(this),
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

        _buildMarker: function (definition, feature, latlng) {
            var html = L.Util.template('<img src="{pictogram_url}"></div>', definition);
            var icon = L.divIcon({className: 'tourism',
                                  html: html,
                                  iconSize: [16, 16],
                                  shadowUrl: IMG_URL + '/../tourism/marker-shadow.png',
                                  shadowSize: [25, 17],
                                  shadowAnchor: [1, 3]});
            icon.createShadow = function (oldIcon) {
                return this._createIcon('shadow', oldIcon);
            };

            var marker = L.marker(latlng, {icon: icon});

            marker.on('click', function (e) {
                var props = L.Util.extend({title:'', description:'', website: ''},
                                          feature.properties);
                var content = L.Util.template("<h3>{title}</h3>" +
                                              "<p>{description}</p>" +
                                              "<p>{website}</p>", props);

                marker.bindPopup(content)
                      .openPopup();
            });

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