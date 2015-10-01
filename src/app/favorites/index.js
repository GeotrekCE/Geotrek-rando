'use strict';

angular.module('rando.favorites', [])
    .service('favoritesService', require('./services').favoritesService)
    .controller('FavoritesController', require('./controllers').FavoritesController)
    .directive('favoritesMenu', require('./directives').favoritesDirective);
