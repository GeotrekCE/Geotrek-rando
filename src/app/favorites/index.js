'use strict';

var angular = require('angular');

angular.module('rando.favorites', [])
    .config(require('./lang').translateFavorites)
    .service('favoritesService', require('./services').favoritesService)
    .controller('FavoritesController', require('./controllers').FavoritesController)
    .directive('favorites', require('./directives').favoritesDirective);