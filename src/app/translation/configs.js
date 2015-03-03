'use strict';

function translationConfig($translateProvider, globalSettings) {
    $translateProvider.preferredLanguage(globalSettings.DEFAULT_LANGUAGE);
}

module.exports = {
    translationConfig: translationConfig
};