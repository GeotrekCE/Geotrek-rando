'use strict';

function translationService(globalSettings) {
    var self = this;

    this.getDefaultLang = function () {
        if (self.defaultLang) {
            return self.defaultLang;
        }

        var localLanguage = navigator.languages[0] || navigator.language || navigator.userLanguage || navigator.browserLanguage || null;
        if (localLanguage) {
            self.defaultLang = localLanguage.substr(0, 2);
            console.log(self.defaultLang);
        } else {
            self.defaultLang = globalSettings.DEFAULT_LANGUAGE;
        }

        return self.defaultLang;
    };
}

module.exports = {
    translationService: translationService
};