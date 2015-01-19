'use strict';

var constants = {

    DOMAIN: 'http://192.168.100.44:8888',
    DEFAULT_LANGUAGE: 'fr',

    // SET TO TRUE ELEMENTS AVAILABLE FOR YOUR GEOTREK !
    ENABLE_TREKS: true,
    ENABLE_TOURISTIC_CONTENT: true,
    ENABLE_TOURISTIC_EVENTS: true,

    // CHOSE POSITION IN CATEGORIES LIST FOR TOURISTICS EVENTS
    // NUMBER FOR SPECIFIC POSITION
    // false FOR LAST POSITION
    TOURISTIC_EVENTS_SPECIFIC_POSITION: 3,

    //PATHS AND DIRECTORY
    FILES_DIR: 'files/api',
    TREK_DIR: 'trek',
    POI_DIR: 'pois',
    TOURISTIC_EVENTS_DIR: 'touristicevents',
    TOURISTIC_EVENT_DIR: 'touristicevent',
    TOURISTIC_CONTENTS_DIR: 'touristiccontents',
    TOURISTIC_CONTENT_DIR: 'touristiccontent',
    CATEGORIES_DIR: 'categories',

    TREKS_FILE: 'trek.geojson',
    POI_FILE: 'poi.geojson',
    EVENTS_FILE: 'touristicevent.geojson',
    TOURISTIC_FILE: 'touristiccontent.geojson',

    MAIN_LEAFLET_BACKGROUND: {
        LAYER_URL: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        ATTRIBUTION: '(c) IGN Geoportail'
    },
    SATELLITE_LEAFLET_BACKGROUND: {
        LAYER_URL: 'http://{s}.tile.mapbox.com/v3/makina-corpus.i3p1001l/{z}/{x}/{y}.png',
        ATTRIBUTION: '(c) MapBox Satellite'
    },

    LEAFLET_CONF: {
        CENTER_LATITUDE: 44.83,
        CENTER_LONGITUDE: 6.34,
        DEFAULT_ZOOM: 12,
        DEFAULT_MIN_ZOOM: 8,
        DEFAULT_MAX_ZOOM: 16,
        TREK_COLOR: '#F89406'
    }

};

function providersConfig($sceDelegateProvider) {

    $sceDelegateProvider.resourceUrlWhitelist([
        // Allow same origin resource loads.
        'self',
        constants.DOMAIN + '/**'
    ]);

    // resrources blacklisted for our app
    $sceDelegateProvider.resourceUrlBlacklist([

    ]);
}

module.exports = {
    constants: constants,
    providersConfig: providersConfig
};