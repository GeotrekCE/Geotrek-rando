'use strict';

var constants = {

    PLATFORM_ID: 'geotrek-rando',
    DOMAIN: 'http://geotrekdemo.ecrins-parcnational.fr',
    ENABLE_HTML_MODE: true,


    // INTERFACE PARAMETERS //
    //
    //
    LOGO_FILE: '', // '' = no logo // Put the file in src/images/custom
    SHOW_HOME: false,
    HOME_TEMPLATE_FILE: {
        fr: '',
        en: ''
    },
    SHOW_FOOTER: false,
    FOOTER_TEMPLATE_FILE: '',

    ENABLE_DISTRICTS_FILTERING: true,
    ENABLE_CITIES_FILTERING: true,
    ENABLE_STRUCTURE_FILTERING: true,

    RULES_FLAT_PAGES_ID: '',



    // LANGUAGES PARAMETERS //
    //
    //

    DEFAULT_LANGUAGE: 'en',
    AVAILABLE_LANGUAGES: [
        {code: 'fr', label: 'Français'},
        {code: 'en', label: 'English'}
    ],


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



    // SOCIAL NETWORKS PARAMETERS //
    //
    //

    FACEBOOK_APP_ID: '1424383581199261',
    TWITTER_ID: '@makina_corpus',
    DEFAULT_SHARE_IMG: 'home/head.jpg',



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
        DEFAULT_MIN_ZOOM: 8,
        DEFAULT_MAX_ZOOM: 18
    },
    TREKS_TO_GEOJSON_ZOOM_LEVEL : 14,
    UPDATE_MAP_ON_FILTER: false,




    // PATHS AND DIRECTORY //
    //
    //


    API_DIR: 'api',
    TREKS_DIR: 'treks',
    TREK_DIR: 'trek',
    POI_DIR: 'pois',
    FLAT_DIR: 'flatpages',
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