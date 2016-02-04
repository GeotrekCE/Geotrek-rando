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

function randomContentsList() {
    return {
        restrict: 'E',
        replace: true,
        template: require('./templates/random-contents-list.html'),
        scope: {
            categories: '@',
            quantity: '@'
        },
        controller: 'RandomContentsListWidgetController'
    };
}

function randomContent() {
    return {
        restrict: 'E',
        replace: true,
        template: require('./templates/random-content.html'),
        scope: {
            category: '@'
        },
        controller: 'RandomContentWidgetController'
    };
}

module.exports = {
    homePage: homePage,
    randomContentsList: randomContentsList,
    randomContent: randomContent
};
