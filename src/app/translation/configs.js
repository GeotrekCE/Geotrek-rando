'use strict';

function translationConfig($translateProvider, globalSettings) {
    $translateProvider.preferredLanguage(globalSettings.DEFAULT_LANGUAGE);
    $translateProvider.useSanitizeValueStrategy('escape');
}

module.exports = {
    translationConfig: translationConfig
};