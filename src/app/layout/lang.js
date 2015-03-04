'use strict';

function translateLayout($translateProvider, globalSettings) {
    $translateProvider.translations('fr', globalSettings.FR_DICTIONNARY);

    $translateProvider.translations('en', globalSettings.EN_DICTIONNARY);
}

module.exports = {
    translateLayout: translateLayout
};