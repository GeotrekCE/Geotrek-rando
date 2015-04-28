'use strict';

function settingsFactory(globalSettings) {

    // PRIVATE VAR
    //
    var _activeLang = globalSettings.DEFAULT_LANGUAGE;


    // PUBLIC VAR
    //
    var treksUrl =  globalSettings.API_URL + '/' + globalSettings.API_DIR + '/$lang/' + globalSettings.TREKS_FILE,
        trekUrl =  globalSettings.API_URL + '/' + globalSettings.API_DIR + '/$lang/' + globalSettings.TREKS_DIR + '/',
        poisUrl =  globalSettings.API_URL + '/' + globalSettings.API_DIR + '/$lang/' + globalSettings.POI_FILE,
        eventsUrl =  globalSettings.API_URL + '/' + globalSettings.API_DIR + '/$lang/' + globalSettings.TOURISTIC_EVENTS_FILE,
        touristicUrl =  globalSettings.API_URL + '/' + globalSettings.API_DIR + '/$lang/' + globalSettings.TOURISTIC_CONTENTS_FILE,
        flatUrl =  globalSettings.API_URL + '/' + globalSettings.API_DIR + '/$lang/' + globalSettings.FLAT_FILE;

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