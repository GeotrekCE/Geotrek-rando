'use strict';

function flatPage() {
    return {
        restrict: 'E',
        replace: true,
        scope: true,
        template: require('./templates/flat-page.html'),
        controller: 'FlatPagesController'
    };
}

function flatMenu() {
    return {
        restrict: 'E',
        replace: true,
        scope: true,
        template: require('./templates/flat-menu.html'),
        controller: 'FlatMenuController'
    };
}

module.exports = {
    flatPage: flatPage,
    flatMenu: flatMenu
};
