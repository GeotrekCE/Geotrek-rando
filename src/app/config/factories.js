'use strict';

function settingsFactory(globalSettings) {

    // CONSTANTS VAR that user can change
    //
    var DOMAIN = 'http://192.168.1.26:8888'/*'http://prod-rando-fr.makina-corpus.net/'*/,

        // SET TO TRUE ELEMENTS AVAILABLE FOR YOUR GEOTREK !
        ENABLE_TREKS = true,
        ENABLE_TOURISTIC_CONTENT = true,
        ENABLE_TOURISTIC_EVENTS = true,

        // CHOSE POSITION IN CATEGORIES LIST FOR TOURISTICS EVENTS
        // NUMBER FOR SPECIFIC POSITION
        // false FOR LAST POSITION
        TOURISTIC_EVENTS_SPECIFIC_POSITION = 3,

        //PATHS AND DIRECTORY
        FILES_DIR = 'files/api',
        TREK_DIR = 'trek',
        POI_DIR = 'pois',
        TOURISTIC_EVENTS_DIR = 'touristicevents',
        TOURISTIC_EVENT_DIR = 'touristicevent',
        TOURISTIC_CONTENTS_DIR = 'touristiccontents',
        TOURISTIC_CONTENT_DIR = 'touristiccontent',
        CATEGORIES_DIR = TOURISTIC_CONTENT_DIR + '/' + 'categories',

        TREKS_FILE = 'trek.geojson',
        POI_FILE = 'poi.geojson',
        EVENTS_FILE = 'touristicevent.geojson',
        TOURISTIC_FILE = 'touristiccontent.geojson',

        MAIN_LEAFLET_BACKGROUND = {
            LAYER_URL: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            ATTRIBUTION: '(c) IGN Geoportail'
        },
        SATELLITE_LEAFLET_BACKGROUND = {
            LAYER_URL: 'http://{s}.tile.mapbox.com/v3/makina-corpus.i3p1001l/{z}/{x}/{y}.png',
            ATTRIBUTION: '(c) MapBox Satellite'
        },

        LEAFLET_CONF = {
            CENTER_LATITUDE: 44.83,
            CENTER_LONGITUDE: 6.34,
            DEFAULT_ZOOM: 12,
            DEFAULT_MIN_ZOOM: 8,
            DEFAULT_MAX_ZOOM: 16,
            TREK_COLOR: '#F89406'
        };

    // PRIVATE VAR
    //
    var _activeLang = globalSettings.DEFAULT_LANGUAGE;


    // PUBLIC VAR
    //
    var treksUrl =  DOMAIN + '/' + _activeLang + '/' + FILES_DIR + '/' + TREK_DIR + '/' + TREKS_FILE,
        poisUrl =  DOMAIN + '/' + _activeLang + '/' + FILES_DIR + '/' + POI_DIR + '/' + POI_FILE,
        eventsUrl =  DOMAIN + '/' + _activeLang + '/' + FILES_DIR + '/' + TOURISTIC_EVENTS_DIR + '/',
        touristicUrl =  DOMAIN + '/' + _activeLang + '/' + FILES_DIR + '/' + TOURISTIC_CONTENTS_DIR + '/',
        categoriesUrl =  DOMAIN + '/' + _activeLang + '/' + FILES_DIR + '/' + CATEGORIES_DIR + '/',
        filters = {
            durations : [
                { id: 4, name: '<1/2 J', interval: [0, 4]},
                { id: 10, name: '1/2 - 1', interval: [4, 10] },
                { id: 24, name: '> 1 J', interval: [10, 99999]}
            ],
            elevations :  [
                { id: 0, name: '<300m', interval: [0, 300] },
                { id: 300, name: '300-600', interval: [301, 600] },
                { id: 600, name: '600-1000', interval: [601, 1000] },
                { id: 1000, name: '>1000m', interval: [1001, 99999] }
            ]
        };

    //PUBLIC METHODS
    //
    var setLang = function (newLang) {
        _activeLang = newLang;
        return true;
    };

    var getLang = function () {
        return _activeLang;
    };



    return {
        //CONSTANTS
        DOMAIN: DOMAIN,
        ENABLE_TREKS: ENABLE_TREKS,
        ENABLE_TOURISTIC_CONTENT: ENABLE_TOURISTIC_CONTENT,
        ENABLE_TOURISTIC_EVENTS: ENABLE_TOURISTIC_EVENTS,
        TOURISTIC_EVENTS_SPECIFIC_POSITION: TOURISTIC_EVENTS_SPECIFIC_POSITION,
        MAIN_LEAFLET_BACKGROUND: MAIN_LEAFLET_BACKGROUND,
        SATELLITE_LEAFLET_BACKGROUND: SATELLITE_LEAFLET_BACKGROUND,
        LEAFLET_CONF: LEAFLET_CONF,

        //PUBLIC VAR
        treksUrl: treksUrl,
        poisUrl: poisUrl,
        eventsUrl: eventsUrl,
        touristicUrl: touristicUrl,
        categoriesUrl: categoriesUrl,
        filters: filters,

        //METHODS
        setLang: setLang,
        getLang: getLang

    };

}

module.exports = {
    settingsFactory: settingsFactory
};