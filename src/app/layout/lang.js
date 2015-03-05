'use strict';

function translateLayout($translateProvider) {
    $translateProvider.translations('fr', require('../translation/lang/fr.json'));

    $translateProvider.translations('en', require('../translation/lang/en.json'));
}

module.exports = {
    translateLayout: translateLayout
};