'use strict';

function translateLayout($translateProvider) {
    var translateFr = require('../translation/lang/fr.json'),
        customFr = require('../translation/lang/fr-custom.json'),
        translateEn = require('../translation/lang/en.json'),
        customEn = require('../translation/lang/en-custom.json'),
        translateDe = require('../translation/lang/de.json'),
        customDe = require('../translation/lang/de-custom.json'),
        translateNl = require('../translation/lang/nl.json'),
        customNl = require('../translation/lang/nl-custom.json');

    _.forEach(customFr, function (translation, transId) {
        if (translateFr[transId]) {
            translateFr[transId] = translation;
        }
    });

    _.forEach(customEn, function (translation, transId) {
        if (translateEn[transId]) {
            translateEn[transId] = translation;
        }
    });

    _.forEach(customDe, function (translation, transId) {
        if (translateDe[transId]) {
            translateDe[transId] = translation;
        }
    });

    _.forEach(customNl, function (translation, transId) {
        if (translateNl[transId]) {
            translateNl[transId] = translation;
        }
    });

    $translateProvider.translations('fr', translateFr);

    $translateProvider.translations('en', translateEn);

    $translateProvider.translations('de', translateDe);
    
    $translateProvider.translations('nl', translateNl);
}

module.exports = {
    translateLayout: translateLayout
};