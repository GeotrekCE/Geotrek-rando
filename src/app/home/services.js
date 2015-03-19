'use strict';

function homeService() {

    this.getChoice = function () {
        if (localStorage.getItem('geotrek-rando-display-home')) {
            return true;
        }
        return false;
    };

    this.setChoice = function () {
        localStorage.setItem('geotrek-rando-display-home', 'dont-display');
    };

    this.removeChoice = function () {
        localStorage.removeItem('geotrek-rando-display-home');
    };
}

module.exports = {
    homeService: homeService
};