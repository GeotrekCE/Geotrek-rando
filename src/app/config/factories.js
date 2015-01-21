'use strict';

function settingsFactory(globalSettings) {

    // PRIVATE VAR
    //
    var _activeLang = globalSettings.DEFAULT_LANGUAGE;


    // PUBLIC VAR
    //
    var treksUrl =  globalSettings.DOMAIN + '/' + globalSettings.API_DIR + '/' + globalSettings.TREK_DIR + '/',
        poisUrl =  globalSettings.DOMAIN + '/' + globalSettings.API_DIR + '/' + globalSettings.POI_DIR + '/',
        eventsUrl =  globalSettings.DOMAIN + '/' + globalSettings.API_DIR + '/' + globalSettings.TOURISTIC_EVENTS_DIR + '/',
        touristicUrl =  globalSettings.DOMAIN + '/' + globalSettings.API_DIR + '/' + globalSettings.TOURISTIC_CONTENTS_DIR + '/',
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

        //PUBLIC VAR
        treksUrl: treksUrl,
        poisUrl: poisUrl,
        eventsUrl: eventsUrl,
        touristicUrl: touristicUrl,
        filters: filters,

        //METHODS
        setLang: setLang,
        getLang: getLang

    };

}

module.exports = {
    settingsFactory: settingsFactory
};