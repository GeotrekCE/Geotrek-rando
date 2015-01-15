'use strict';

function MapController(settingsFactory) {
    var map = L.map('map').setView([settingsFactory.LEAFLET_CONF.CENTER_LATITUDE, settingsFactory.LEAFLET_CONF.CENTER_LONGITUDE], settingsFactory.LEAFLET_CONF.DEFAULT_ZOOM);

    L.tileLayer(settingsFactory.LEAFLET_BACKGROUND_URL, {
        attribution: settingsFactory.LEAFLET_CONF.ATTRIBUTION,
        minZoom: settingsFactory.LEAFLET_CONF.DEFAULT_MIN_ZOOM,
        maxZoom: settingsFactory.LEAFLET_CONF.DEFAULT_MAX_ZOOM
    }).addTo(map);
}

module.exports = {
    MapController : MapController
};