'use strict';

function settingsFactory(globalSettings) {

    // PRIVATE VAR
    //
    var _activeLang = globalSettings.DEFAULT_LANGUAGE;


    // PUBLIC VAR
    //
    var treksUrl =  globalSettings.DOMAIN + '/' + globalSettings.DATA_DIR + '/' + globalSettings.API_DIR + '/$lang/' + globalSettings.TREKS_FILE,
        trekUrl =  globalSettings.DOMAIN + '/' + globalSettings.DATA_DIR + '/' + globalSettings.API_DIR + '/$lang/' + globalSettings.TREKS_DIR + '/',
        poisUrl =  globalSettings.DOMAIN + '/' + globalSettings.DATA_DIR + '/' + globalSettings.API_DIR + '/$lang/' + globalSettings.POI_FILE,
        eventsUrl =  globalSettings.DOMAIN + '/' + globalSettings.DATA_DIR + '/' + globalSettings.API_DIR + '/$lang/' + globalSettings.TOURISTIC_EVENTS_FILE,
        touristicUrl =  globalSettings.DOMAIN + '/' + globalSettings.DATA_DIR + '/' + globalSettings.API_DIR + '/$lang/' + globalSettings.TOURISTIC_CONTENTS_FILE,
        flatUrl =  globalSettings.DOMAIN + '/' + globalSettings.DATA_DIR + '/' + globalSettings.API_DIR + '/$lang/' + globalSettings.FLAT_FILE;

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

        //PUBLIC VAR
        treksUrl: treksUrl,
        trekUrl: trekUrl,
        poisUrl: poisUrl,
        eventsUrl: eventsUrl,
        touristicUrl: touristicUrl,
        flatUrl: flatUrl,

        //METHODS
        setLang: setLang,
        getLang: getLang

    };

}

module.exports = {
    settingsFactory: settingsFactory
};