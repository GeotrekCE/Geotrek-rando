(function (window) {
    'use strict';

    L.Control.TourismLayers = L.Control.extend({
        includes: L.Mixin.Events,
        options: {
            /* Override at class level
                   L.Control.TourismLayers.prototype.options = {}
               or at instance level using
                   map.tourismLayers.setOptions(..);
             */
            position: 'bottomleft',

            iconSize: [12, 12],
            popupSize: [450, 300],
            shadowUrl: window.IMG_URL + '/../tourism/marker-shadow.png',
            shadowSize: [25, 17],
            shadowAnchor: [6, 6]
        },

        initialize: function (base_url, definitions) {
            this.base_url = base_url;
            this.definitions = definitions;
            this.layers = [];
        },

        onAdd: function(map) {
            this.map = map;
            this._container = L.DomUtil.create('div', 'simple-layer-switcher tourism');

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
            // Custom layer id for localStorage
            layer.key = 'tourism-layer-' + definition.id;

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

            // Restore state from localStorage
            if (window.localStorage.getItem(layer.key) !== null) {
                this.toggleLayer(button, layer);
            }
        },

        toggleLayer: function (button, layer) {
            var onMap = this.map.hasLayer(layer);
            L.DomUtil[onMap ? 'removeClass' : 'addClass'](button, 'active');
            this.map[onMap ? 'removeLayer' : 'addLayer'](layer);
            window.localStorage[onMap ? 'removeItem' : 'setItem'](layer.key, 'shown');
        },

        _buildMarker: function (definition, feature, latlng) {
            var html = L.Util.template('<img src="{pictogram_url}"></div>', definition);
            var icon = L.divIcon({className: 'tourism',
                                  html: html,
                                  iconSize: this.options.iconSize,
                                  shadowUrl: this.options.shadowUrl,
                                  shadowSize: this.options.shadowSize,
                                  shadowAnchor: this.options.shadowAnchor});
            icon.createShadow = function (oldIcon) {
                return this._createIcon('shadow', oldIcon);
            };

            var marker = L.marker(latlng, {icon: icon});
            marker.on('click', function (e) {
                this._buildMarkerPopup(marker);
                marker.openPopup();
            }, this);

            return marker;
        },

        _buildMarkerPopup: function (marker) {
            if (marker._popup)
                return;

            var props = marker.feature.properties;

            // Set default values to empty strings
            var expected = ['title', 'description', 'website', 'phone'];
            for (var i=0, n = expected.length; i < n; i++ ) {
                props[expected[i]] = props[expected[i]] || '';
            }

            props.picture_url = props.pictures && props.pictures.length > 0 ?
                                props.pictures[0].url : '';
            props.website = props.website === '' ? '' :
                            /https?/.test(props.website) ? props.website :
                            'http://' + props.website;
            props['website_label'] = gettext('Website');
            props['phone_label'] = gettext('Contact');

            var content = L.Util.template('<div class="tourism">' +
                                            '<h3>{title}</h3>' +
                                            '<img class="preview" src="{picture_url}" height="150">' +
                                            '<p class="description">{description}</p>' +
                                            '<a class="website" href="{website}" target="_blank">{website_label}</a>' +
                                            '<span class="phone">{phone_label}: <a href="tel:{phone}">{phone}</a></span>' +
                                          '</div>', props);
            var popup = L.popup({
                            maxWidth: this.options.popupSize[0],
                            minWidth: this.options.popupSize[0],
                            maxHeight: this.options.popupSize[1]
                          })
                         .setLatLng(marker.getLatLng())
                         .setContent(content);
            marker.bindPopup(popup);
            return popup;
        }
    });


    var $script_tag = $('script#tourism'),
        datasources_url = $script_tag.data('datasources-url'),
        base_url = $script_tag.data('base-url');

    $(window).on('map:init', function (e) {
        var data = e.detail || e.originalEvent.detail,
            map = data.map,
            containerId = map._container.id;

        // Show tourism layers everywhere except on feedback form
        if (containerId === 'feedbackmap')
            return;

        $.getJSON(datasources_url, function (data) {
            var definitions = data.filter(function public_datasources(def) {
                return (!def.targets || def.targets.indexOf('public') > -1);
            });
            var control = map.tourismLayers = new L.Control.TourismLayers(base_url,
                                                                          definitions);
            control.addTo(map);

            $('a', control._container).tooltip({placement: 'right'});
        }).error(function () {
            throw new Error("Could not obtain external datasources " + datasources_url);
        });
    });

})(window);