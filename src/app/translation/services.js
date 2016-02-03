'use strict';

function translationService(globalSettings) {
    var self = this,
        storageName = globalSettings.PLATFORM_ID + '-language';

    this.getDefaultLang = function getDefaultLang () {

        var favoriteLang = self.getFavoriteLang();

        if (favoriteLang) {
            self.defaultLang = favoriteLang;
        }

        if (!self.defaultLang && !favoriteLang) {
            var localLanguage;
            if (navigator.languages) {
                localLanguage = navigator.languages[0];
            } else {
                localLanguage = navigator.language || navigator.userLanguage || navigator.browserLanguage || null;
            }
            self.defaultLang = this.getLang(globalSettings.DEFAULT_LANGUAGE).code;

            if (localLanguage) {
                _.forEach(this.getAllLang, function (lang) {
                    if (localLanguage.substr(0, 2) === lang.code) {
                        self.defaultLang = lang.code;
                    }
                });
            }
        }
        self.currentLang = self.defaultLang;
        return self.currentLang;
    };

    this.getCurrentLang = function getCurrentLang () {
        if (self.currentLang) {
            return self.currentLang;
        }
        return self.getDefaultLang();
    };

    this.setCurrentLang = function setCurrentLang (lang) {
        self.currentLang = lang;
    };

    this.getAllLang = function getAllLang () {
        if (!self.languages) {
            self.languages = [];
            var enabledLangs = globalSettings.ENABLED_LANGUAGES;
            var availableLangs = globalSettings.AVAILABLE_LANGUAGES;
            for (var i = 0; i < enabledLangs.length; i++) {
                var langCode = enabledLangs[i];
                if (availableLangs[langCode]) {
                    self.languages.push({
                        code: langCode,
                        label: availableLangs[langCode]
                    });
                }
            }
        }

        return self.languages;
    };

    this.getLang = function getLang (langCode) {
        var languages = this.getAllLang();

        for (var i = languages.length - 1; i >= 0; i--) {
            var currentLang = languages[i];
            if (currentLang.code === langCode) {
                return currentLang;
            }
        }

        return false;
    };

    this.getFavoriteLang = function getFavoriteLang () {
        if (!localStorage.getItem(storageName)) {
            return false;
        }

        var localLanguage = localStorage.getItem(storageName);

        try {
            JSON.parse(localLanguage, function() {
                self.currentLang = JSON.parse(localLanguage).code;
                self.setFavoriteLang();
            });
            return self.currentLang;
        } catch (e) {
            return localStorage.getItem(storageName);
        }
    };

    this.setFavoriteLang = function setFavoriteLang () {
        if (self.currentLang) {
            localStorage.setItem(storageName, self.currentLang);
        }
    };
}

module.exports = {
    translationService: translationService
};
