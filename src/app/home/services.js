'use strict';

function homeService(globalSettings) {

    var storageName = globalSettings.PLATFORM_ID + '-display-home';

    this.getChoice = function () {
        if (localStorage.getItem(storageName)) {
            return true;
        }
        return false;
    };

    this.setChoice = function () {
        localStorage.setItem(storageName, 'dont-display');
    };

    this.removeChoice = function () {
        localStorage.removeItem(storageName);
    };
}

module.exports = {
    homeService: homeService
};