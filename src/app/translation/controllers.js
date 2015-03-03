'use strict';

function TranslationController($scope, $translate, globalSettings, translationService) {
    function initTranslation() {
        $scope.languages = globalSettings.AVAILABLE_LANGUAGES;
        $scope.activeLang = translationService.getDefaultLang();
        $translate.use($scope.activeLang);
    }

    $scope.toggleLang = function (langCode) {
        $scope.activeLang = langCode;
        $translate.use(langCode);
    };

    initTranslation();
}

module.exports = {
    TranslationController: TranslationController
};