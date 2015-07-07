'use strict';

function favoritesDirective() {
    return {
        restrict: 'E',
        replace: true,
        scope: true,
        template: require('./templates/favorites.html'),
        controller: 'FavoritesController'
    };
}

module.exports = {
    favoritesDirective: favoritesDirective
};
