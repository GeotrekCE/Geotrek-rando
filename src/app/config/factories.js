'use strict';

function settingsFactory(globalSettings) {

    // CONSTANTS VAR that user can change
    //
    var DOMAIN = 'http://192.168.100.44:8888',

        //PATHS AND DIRECTORY
        FILES_DIR = 'files/api',
        TREK_DIR = 'trek',
        TILES_DIR = 'tiles',

        TREKS_FILE = 'trek.geojson',
        //POI_FILE = 'pois.geojson',

        LEAFLET_BACKGROUND_URL = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',

        LEAFLET_CONF = {
            CENTER_LATITUDE: 44.83,
            CENTER_LONGITUDE: 6.34,
            DEFAULT_ZOOM: 12,
            DEFAULT_MIN_ZOOM: 8,
            DEFAULT_MAX_ZOOM: 16,
            ATTRIBUTION: '(c) IGN Geoportail',
            TREK_COLOR: '#F89406'
        };

    // PRIVATE VAR
    //
    var _activeLang = globalSettings.DEFAULT_LANGUAGE;


    // PUBLIC VAR
    //
    var treksUrl =  DOMAIN + '/' + FILES_DIR + '/' + TREK_DIR + '/' + TREKS_FILE;

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
        LEAFLET_BACKGROUND_URL: LEAFLET_BACKGROUND_URL,
        LEAFLET_CONF: LEAFLET_CONF,

        //PUBLIC VAR
        treksUrl: treksUrl,

        //METHODS
        setLang: setLang,
        getLang: getLang

    };

}

module.exports = {
    settingsFactory: settingsFactory
};