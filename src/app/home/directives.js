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

function randomContent() {
    return {
        restrict: 'E',
        replace: true,
        template: require('./templates/random-contents.html'),
        scope: {
            categories: '@',
            quantity: '@',
        },
        controller: 'RandomWidgetController'
    };
}

module.exports = {
    homePage: homePage,
    randomContent: randomContent
};
