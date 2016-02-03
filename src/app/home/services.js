'use strict';

function homeService(globalSettings) {

    var storageName = globalSettings.PLATFORM_ID + '-display-home';

    this.getChoice = function getChoice () {
        if (localStorage.getItem(storageName)) {
            return true;
        }
        return false;
    };

    this.setChoice = function setChoice () {
        localStorage.setItem(storageName, 'dont-display');
    };

    this.removeChoice = function removeChoice () {
        localStorage.removeItem(storageName);
    };
}

module.exports = {
    homeService: homeService
};
