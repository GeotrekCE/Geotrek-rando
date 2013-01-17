var TrekLayer = L.ObjectsLayer.extend({

    initialize: function (geojson, options) {
        L.ObjectsLayer.prototype.initialize.call(this, geojson, options);
    },
});
