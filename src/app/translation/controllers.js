'use strict';

function TranslationController($scope, $rootScope, $translate, translationService) {
    function initTranslation() {
        $scope.languages = translationService.getAllLang();
        $scope.activeLang = translationService.getDefaultLang();
        $translate.use($scope.activeLang.code);
        $rootScope.$emit('translationReady');
    }

    $scope.toggleLang = function (lang) {
        $scope.activeLang = lang;
        translationService.setCurrentLang(lang);
        translationService.setFavoriteLang();
        $translate.use(lang.code);
        $rootScope.$emit('startSwitchGlobalLang');
    };

    initTranslation();
}

module.exports = {
    TranslationController: TranslationController
};