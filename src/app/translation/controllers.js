'use strict';

function TranslationController($scope, $rootScope, $translate, translationService) {
    function initTranslation() {
        $scope.languages = translationService.getAllLang();
        $rootScope.lang = translationService.getCurrentLang();
        $translate.use($rootScope.lang);
        window.moment.locale($rootScope.lang);
        $rootScope.$emit('translationReady');
    }

    $scope.toggleLang = function (lang) {
        translationService.setCurrentLang(lang);
        translationService.setFavoriteLang();
        $rootScope.lang = lang;
        $translate.use(lang);
        $rootScope.$emit('startSwitchGlobalLang');
    };

    initTranslation();
}

module.exports = {
    TranslationController: TranslationController
};
