'use strict';

function TranslationController($scope, $rootScope, $translate, translationService) {
    function initTranslation() {
        $scope.languages = translationService.getAllLang();
        $scope.activeLang = translationService.getDefaultLang();
        $translate.use($scope.activeLang.code);
    }

    $scope.toggleLang = function (lang) {
        $scope.activeLang = lang;
        translationService.setCurrentLang(lang);
        $translate.use(lang.code);
        $rootScope.$emit('switchGlobalLang');
    };

    initTranslation();
}

module.exports = {
    TranslationController: TranslationController
};