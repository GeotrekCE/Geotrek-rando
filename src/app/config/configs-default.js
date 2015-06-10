'use strict';

var constants = {

    PLATFORM_ID: 'geotrek-rando',
    API_URL: 'http://geotrekdemo.ecrins-parcnational.fr',
    ENABLE_HTML_MODE: true,


    // INTERFACE PARAMETERS //
    //
    //
    LOGO_FILE: '', // '' = no logo // Put the file in src/images/custom
    FAVICON: '', // Should be an object containing png: 'file.png', and ico: 'file.ico' // Put the file in src/images/custom
    SHOW_HOME: false,
    HOME_TEMPLATE_FILE: {
        fr: '',
        en: '',
        de: '',
        nl: ''
    },
    SHOW_FOOTER: false,
    FOOTER_TEMPLATE_FILE: '',

    ENABLE_DISTRICTS_FILTERING: true,
    ENABLE_CITIES_FILTERING: true,
    ENABLE_STRUCTURE_FILTERING: true,

    RULES_FLAT_PAGES_ID: '',
    FAVORITES_ICON: '', // use font awesome plain icons (outline for results is done in css) ('' -> heart)
    SHARE_ICON: '', // use font awesome icons ('' -> arrow share icon)
    PLACEHOLDER_IMAGE: '', //defined path to custom placeholder image from /images/custom


    // LANGUAGES PARAMETERS //
    //
    //

    DEFAULT_LANGUAGE: 'fr',
    AVAILABLE_LANGUAGES: [
        {code: 'fr', label: 'Français'},
        {code: 'en', label: 'English'},
        {code: 'de', label: 'Deutsch'},
        {code: 'nl', label: 'Nederlands'}
    ],


    // CATEGORIES PARAMETERS //
    //
    //

    // SET TO TRUE ELEMENTS AVAILABLE FOR YOUR GEOTREK !
    ENABLE_TREKS: true,
    ENABLE_TOURISTIC_CONTENT: true,
    ENABLE_TOURISTIC_EVENTS: true,

    // CHOSE WHICH CATEGORIES ARE ACTIVE BY DEFAULT
    DEFAULT_ACTIVE_CATEGORIES: ['T'],

    // CHOSE WHICH CATEGORIES ARE EXCLUDE FROM CAT MENU
    LIST_EXCLUDE_CATEGORIES: [],

    // CHOSE WHICH INTEREST TO SHOW BY DEFAULT // possible values -> 'pois' | 'near' | 'children' | 'parent'
    DEFAULT_INTEREST: 'pois',



    // SOCIAL NETWORKS PARAMETERS //
    //
    //

    FACEBOOK_APP_ID: '1424383581199261',
    TWITTER_ID: '@makina_corpus',
    DEFAULT_SHARE_IMG: 'home/head.jpg',
    GOOGLE_ANALYTICS_ID: '',


    // MAP PARAMETERS //
    //
    //

    MAIN_LEAFLET_BACKGROUND: {
        LAYER_URL: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        OPTIONS: {
            id: 'main',
            attribution: '(c) OpenstreetMap'
        }
    },
    SATELLITE_LEAFLET_BACKGROUND: {
        LAYER_URL: 'http://{s}.tile.mapbox.com/v3/makina-corpus.i3p1001l/{z}/{x}/{y}.png',
        OPTIONS: {
            id: 'satellite',
            attribution: '(c) MapBox Satellite'
        }
    },

    LEAFLET_CONF: {
        CENTER_LATITUDE: 44.83,
        CENTER_LONGITUDE: 6.34,
        DEFAULT_ZOOM: 12,
        DEFAULT_MIN_ZOOM: 8,
        DEFAULT_MAX_ZOOM: 17
    },
    TREKS_TO_GEOJSON_ZOOM_LEVEL : 14,
    UPDATE_MAP_ON_FILTER: false,
    ACTIVE_MINIMAP: true,
    MINIMAP_ZOOM: {
        MINI: 0,
        MAX: 12
    },
    MINIMAP_OFFSET: -3,
    ALWAYS_HIGHLIGHT_TREKS: false,

    // Put the files in src/images/custom/map
    MARKER_BASE_ICON: '',
    DEPARTURE_ICON: '',
    ARRIVAL_ICON: '',
    DEPARTURE_ARRIVAL_ICON: '',

    SHOW_FILTERS_ON_MAP: true,

    // PATHS AND DIRECTORY //
    //
    //


    API_DIR: 'api',
    TREKS_DIR: 'treks',
    TREKS_FILE: 'treks.geojson',
    POI_FILE: 'pois.geojson',
    FLAT_FILE: 'flatpages.geojson',
    TOURISTIC_EVENTS_DIR: 'touristicevents',
    TOURISTIC_EVENTS_FILE: 'touristicevents.geojson',
    TOURISTIC_CONTENTS_DIR: 'touristiccontents',
    TOURISTIC_CONTENTS_FILE: 'touristiccontents.geojson',
    DEM_FILE: 'dem.json',
    PROFILE_FILE: 'profile.json',




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
        ],
        LENGTH :  [
            { id: 0, label: '<10km'},
            { id: 10000, label: '10km'},
            { id: 20000, label: '20km'},
            { id: 30000, label: '30km'},
            { id: 99999, label: '>30km'}
        ]
    }

};

function providersConfig($sceDelegateProvider) {

    $sceDelegateProvider.resourceUrlWhitelist([
        // Allow same origin resource loads.
        'self',
        constants.API_URL + '/**'
    ]);

    // resrources blacklisted for our app
    $sceDelegateProvider.resourceUrlBlacklist([

    ]);
}

module.exports = {
    constants: constants,
    providersConfig: providersConfig
};