'use strict';

var controllers = require('./controllers');

function favoritesDirective() {
    return {
        restrict: 'E',
        replace: true,
        scope: true,
        template: require('./templates/favorites.html'),
        controller: controllers.FavoritesController
    };
}

module.exports = {
    favoritesDirective: favoritesDirective
};