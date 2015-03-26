'use strict';

var controllers = require('./controllers');

function flatPage() {
    return {
        restrict: 'E',
        replace: true,
        scope: true,
        template: require('./templates/flat-page.html'),
        controller: controllers.FlatPagesController
    };
}

function flatMenu() {
    return {
        restrict: 'E',
        replace: true,
        scope: true,
        template: require('./templates/flat-menu.html'),
        controller: controllers.FlatMenuController
    };
}

module.exports = {
    flatPage: flatPage,
    flatMenu: flatMenu
};