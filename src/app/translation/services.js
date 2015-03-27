'use strict';

function translationService(globalSettings) {
    var self = this,
        storageName = globalSettings.PLATFORM_ID + '-language';

    this.getDefaultLang = function () {

        var favoriteLang = self.getFavoriteLang();

        if (favoriteLang) {
            self.defaultLang = favoriteLang;
        }

        if (!self.defaultLang && !favoriteLang) {
            var localLanguage = navigator.languages[0] || navigator.language || navigator.userLanguage || navigator.browserLanguage || null;
            self.defaultLang = globalSettings.DEFAULT_LANGUAGE;

            if (localLanguage) {
                _.forEach(globalSettings.AVAILABLE_LANGUAGES, function (lang) {
                    if (localLanguage.substr(0, 2) === lang.code) {
                        self.defaultLang = lang;
                    }
                });
            }
        }

        //TEST PURPOSE FORCE USE OF A DEFAULT LANG
        //self.defaultLang = globalSettings.AVAILABLE_LANGUAGES[1];

        self.currentLang = self.defaultLang;
        return self.defaultLang;
    };

    this.getCurrentLang = function () {
        if (!self.currentLang) {
            return self.getDefaultLang();
        }
        return self.currentLang;
    };

    this.setCurrentLang = function (currentLang) {
        self.currentLang = currentLang;
    };

    this.getAllLang = function () {
        if (!self.languages) {
            self.languages = globalSettings.AVAILABLE_LANGUAGES;
        }

        return self.languages;
    };

    this.getFavoriteLang = function () {

        if (!localStorage.getItem(storageName)) {
            return false;
        }

        var lang_json = localStorage.getItem(storageName);
        return JSON.parse(lang_json);
    };

    this.setFavoriteLang = function () {
        if (self.currentLang) {
            var lang_json = JSON.stringify(self.currentLang);
            localStorage.setItem(storageName, lang_json);
        }
    };
}

module.exports = {
    translationService: translationService
};