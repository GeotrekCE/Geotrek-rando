'use strict';

function TranslationController($scope, $rootScope, $translate, globalSettings, translationService) {

    $scope.aboutIcon = (globalSettings.ABOUT_ICON ? globalSettings.ABOUT_ICON : 'bars');

    function initTranslation() {
        $scope.languages = translationService.getAllLang();
        $rootScope.lang = translationService.getCurrentLang();
        $translate.use($rootScope.lang);
        window.moment.locale($rootScope.lang);
        $rootScope.$emit('translationReady');
    }

    $scope.toggleLang = function toggleLang (lang) {
        translationService.setCurrentLang(lang);
        translationService.setFavoriteLang();
        $rootScope.lang = lang;
        $translate.use(lang);
        $rootScope.$emit('startSwitchGlobalLang');
    };

    $scope.showTranslationMenu = false;
    $scope.toggleTranslationMenu = function toggleTranslationMenu() {
        $scope.showTranslationMenu = !$scope.showTranslationMenu;
    };
    $scope.foldTranslationMenu = function foldTranslationMenu() {
        $scope.showTranslationMenu = false;
    }


    initTranslation();
}

module.exports = {
    TranslationController: TranslationController
};
