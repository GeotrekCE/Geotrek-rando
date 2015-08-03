'use strict';

function translationConfig($translateProvider, globalSettings) {
    $translateProvider.translations('fr', require('../translation/lang/fr.json'));

    $translateProvider.translations('en', require('../translation/lang/en.json'));

    $translateProvider.translations('de', require('../translation/lang/de.json'));

    $translateProvider.translations('nl', require('../translation/lang/nl.json'));

    $translateProvider.preferredLanguage(globalSettings.DEFAULT_LANGUAGE);
    $translateProvider.useSanitizeValueStrategy('escape');
}

module.exports = {
    translationConfig: translationConfig
};
