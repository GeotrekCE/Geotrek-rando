'use strict';

function TranslationController($scope, $rootScope, $translate, translationService) {
    function initTranslation() {
        $scope.languages = translationService.getAllLang();
        $scope.activeLang = translationService.getCurrentLang();
        $translate.use($scope.activeLang);
        $rootScope.$emit('translationReady');
    }

    $scope.toggleLang = function (lang) {
        translationService.setCurrentLang(lang);
        translationService.setFavoriteLang();
        $scope.activeLang = lang;
        $translate.use(lang);
        $rootScope.$emit('startSwitchGlobalLang');
    };

    initTranslation();
}

module.exports = {
    TranslationController: TranslationController
};
