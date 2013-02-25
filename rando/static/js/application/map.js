var TrekLayer = L.ObjectsLayer.extend({

    initialize: function (geojson, options) {
        L.ObjectsLayer.prototype.initialize.call(this, geojson, options);
    },
});


var FakeBoundsMapMixin = {
    __fakeBounds: function (bounds) {
        /* Depending on sidebar open/close, we correct the bounds of the map
        If init, we increase, else we reduce.
        */
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
              var bounds = this.getBounds();
              localStorage.setItem('mapView', JSON.stringify([
                      [bounds.getSouthWest().lat, bounds.getSouthWest().lng],
                      [bounds.getNorthEast().lat, bounds.getNorthEast().lng]
                ])
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