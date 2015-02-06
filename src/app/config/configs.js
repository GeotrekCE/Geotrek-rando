'use strict';

var constants = {

    DOMAIN: 'http://geotrekdemo.ecrins-parcnational.fr',
    DEFAULT_LANGUAGE: 'fr',


    // CATEGORIES PARAMETERS //
    //
    //

    // SET TO TRUE ELEMENTS AVAILABLE FOR YOUR GEOTREK !
    ENABLE_TREKS: true,
    ENABLE_TOURISTIC_CONTENT: true,
    ENABLE_TOURISTIC_EVENTS: true,

    // CHOSE POSITION IN CATEGORIES LIST FOR TOURISTICS EVENTS
    // NUMBER FOR SPECIFIC POSITION
    // false FOR LAST POSITION
    TOURISTIC_EVENTS_SPECIFIC_POSITION: 3,

    // CATEGORIES ID BECAUS NOT AVAILABLE IN DATA JSON
    TREKS_CATEGORY_ID: 80085,
    EVENTS_CATEGORY_ID: 54635,

    // CHOSE WHICH CATEGORIES ARE ACTIVE BY DEFAULT
    DEFAULT_ACTIVE_CATEGORIES: [80085],



    // MAP PARAMETERS //
    //
    //

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
        DEFAULT_MIN_ZOOM: 0,
        DEFAULT_MAX_ZOOM: 16,
        TREK_COLOR: '#F89406'
    },
    TREKS_TO_GEOJSON_ZOOM_LEVEL : 14,
    UPDATE_MAP_ON_FILTER: false,




    // PATHS AND DIRECTORY //
    //
    //


    API_DIR: 'api',
    TREK_DIR: 'treks',
    POI_DIR: 'pois',
    TOURISTIC_EVENTS_DIR: 'touristicevents',
    TOURISTIC_CONTENTS_DIR: 'touristiccontents',




    // FILTERS VALUES //
    //
    //
    FILTERS: {
        DURATION : [
            { id: 4, name: '<1/2 J', interval: {min: 0, max: 4} },
            { id: 10, name: '1/2 - 1', interval: {min: 4, max: 10} },
            { id: 24, name: '> 1 J', interval: {min: 10, max: 99999} }
        ],
        ASCENT :  [
            { id: 0, name: '<300m', interval: {min: 0, max: 300} },
            { id: 300, name: '300-600', interval: {min: 301, max: 600} },
            { id: 600, name: '600-1000', interval: {min: 601, max: 1000} },
            { id: 1000, name: '>1000m', interval: {min: 1001, max: 99999} }
        ]
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