var TREK_LAYER_OPTIONS = TREK_LAYER_OPTIONS || {
    style: {'color': '#F89406', 'weight': 5, 'opacity': 0.8},
    hoverstyle: {'color': '#F89406', 'weight': 5, 'opacity': 1.0},
    outlinestyle: {'color': 'yellow', 'weight': 10, 'opacity': 0.8},
};


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
                highlight: true,
            },
            TREK_LAYER_OPTIONS
        );
        L.ObjectsLayer.prototype.initialize.call(this, geojson, options);

        this._hover = null;
    },

    highlight: function (pk, on) {
        var on = on === undefined ? true : on,
            layer = this.getLayer(pk);
        if (!layer) return;
        if (!this._map) return;
        if (on) {
            if (layer instanceof L.Polyline) {
                this._hover = new L.Polyline(layer.getLatLngs());
            }
            else if (layer instanceof L.MultiPolyline) {
                var coords = [];
                layer.eachLayer(function (l) { coords.push(l.getLatLngs()); });
                this._hover = new L.MultiPolyline(coords);
            }
            this._hover.setStyle(TREK_LAYER_OPTIONS.outlinestyle);
            this._hover.addTo(this._map); 
            // Pop on top
            layer.setStyle(TREK_LAYER_OPTIONS.hoverstyle);
            this._map.removeLayer(layer).addLayer(layer);
        }
        else {
            if (this._hover) this._map.removeLayer(this._hover);
            layer.setStyle(TREK_LAYER_OPTIONS.style);
        }
    },
});


var FakeBoundsMapMixin = {
    __fakeBounds: function (bounds) {
        /* Depending on sidebar open/close, we correct the bounds of the map
        If init, we increase, else we reduce.
        */
        if (!this._loaded)
            return bounds;

        var mapBounds = this.getBounds(),
            from =  arguments.length == 0,
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
        this.fitBounds(this.__fakeBounds(bounds));
    },

    getFakeBounds: function () {
        return this.__fakeBounds();
    },
};

L.Map.include(FakeBoundsMapMixin);



var RestoreViewMixin = {
    restoreView: function () {
        if (!this.__initRestore) {
            this.on('moveend', function (e) {
              var bounds = this.getBounds()
                , view = [
                      [bounds.getSouthWest().lat, bounds.getSouthWest().lng],
                      [bounds.getNorthEast().lat, bounds.getNorthEast().lng]
              ];
              if (!bounds.isValid() || view[1][0] - view[0][0] < 0.001 || view[1][1] - view[0][1] < 0.001) {
                  console.warn("Invalid view: " + view);
                  return;
              }
              localStorage.setItem('mapView', JSON.stringify()
              );
            }, this);
            this.__initRestore = true;
        }

        var retrievedObject = localStorage.getItem('mapView');
        if (!retrievedObject) {
            return false;
        }
        try {
            view = JSON.parse(retrievedObject);
            this.fitBounds(view);
            return true;
        }
        catch (err) {}
    },
};

L.Map.include(RestoreViewMixin);