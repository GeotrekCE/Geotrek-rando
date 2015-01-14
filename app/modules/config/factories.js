'use strict';

function settingsFactory(globalSettings) {

    // CONSTANTS VAR that user can change
    //
    var DOMAIN = 'http://192.168.100.44:8888',

        //PATHS AND DIRECTORY
        FILES_DIR = 'files/api',
        TREK_DIR = 'trek',
        TILES_DIR = 'tiles',

        TREKS_FILE = 'trek.geojson';
        //POI_FILE = 'pois.geojson',


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