'use strict';

function translateLayout($translateProvider) {
    var translateFr = require('../translation/lang/fr.json'),
        customFr = require('../translation/lang/fr-custom.json'),
        translateEn = require('../translation/lang/en.json'),
        customEn = require('../translation/lang/en-custom.json');

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

    $translateProvider.translations('fr', translateFr);

    $translateProvider.translations('en', translateEn);
}

module.exports = {
    translateLayout: translateLayout
};