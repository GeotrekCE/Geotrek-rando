'use strict';

var constants = {

    DOMAIN: 'http://geotrekdemo.ecrins-parcnational.fr',
    DEFAULT_LANGUAGE: 'fr',
    ENABLE_HTML_MODE: true,

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

    // CHOSE WHICH CATEGORIES ARE ACTIVE BY DEFAULT
    DEFAULT_ACTIVE_CATEGORIES: [-2],



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
            { id: 0, label: '<1/2 J'},
            { id: 10, label: '1/2 J'},
            { id: 24, label: '1 J'},
            { id: 999, label: '> 1 J'}
        ],
        ASCENT :  [
            { id: 0, label: '<300m'},
            { id: 300, label: '300'},
            { id: 600, label: '600'},
            { id: 1000, label: '1000'},
            { id: 9999, label: '>1000m'}
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