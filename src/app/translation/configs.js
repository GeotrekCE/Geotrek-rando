'use strict';

function translationConfig($translateProvider, globalSettings) {
    var langs = require('../translation/lang/lang.json');

    angular.forEach(langs, function (translation, langCode) {
        $translateProvider.translations(langCode, translation);
    });

    $translateProvider.preferredLanguage(globalSettings.DEFAULT_LANGUAGE);
    $translateProvider.useSanitizeValueStrategy('escape');
}

module.exports = {
    translationConfig: translationConfig
};
