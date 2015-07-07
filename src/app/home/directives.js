'use strict';

function homePage() {
    return {
        restrict: 'E',
        replace: true,
        scope: true,
        template: require('./templates/home-base.html'),
        controller: 'HomeController'
    };
}

module.exports = {
    homePage: homePage
};
