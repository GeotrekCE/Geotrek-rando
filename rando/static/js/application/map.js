var TrekLayer = L.ObjectsLayer.extend({

    initialize: function (geojson, options) {
        L.ObjectsLayer.prototype.initialize.call(this, geojson, options);
    },
});


function fakeBounds(mapbounds, force) {
    /* Depending on sidebar open/close, we correct the bounds of the map
    If init, we increase, else we reduce.
    */
    var force = !!force,
        visible = !$('#show-side-bar').is(':visible');
    if (!visible && !force) {
        return mapbounds;
    }
    // Reduce bounds of 30% (c.f. width of sidebar)
    var oldSouthWest = mapbounds.getSouthWest(),
        boundswidth = mapbounds.getSouthEast().lng - oldSouthWest.lng,
        offset = 0.3 * boundswidth, 
        southWest = L.latLng(oldSouthWest.lat, oldSouthWest.lng - offset);
    return L.latLngBounds(southWest, mapbounds.getNorthEast());
}