'use strict';

function favoritesService() {

    var self = this;

    this.getFavorites = function () {
        if (self._favorites) {
            return self._favorites;
        }

        if (!localStorage.getItem('geotrek-rando-favorites')) {
            self._favorites = {};
            self.setFavorites();
        } else {
            var favorites_json = localStorage.getItem('geotrek-rando-favorites');
            self._favorites = JSON.parse(favorites_json);
        }

        return self._favorites;
    };

    this.setFavorites = function () {
        var favorites_json = JSON.stringify(self._favorites);
        localStorage.setItem('geotrek-rando-favorites', favorites_json);
    };

    this.removeAllFavorites = function () {
        self._favorites = {};
        localStorage.removeItem('geotrek-rando-favorites');
    };

    this.addAFavorite = function (element) {
        if (!self._favorites[element.category.id + '-' + element.id]) {
            self._favorites[element.category.id + '-' + element.id] = {
                slug: element.properties.slug
            };
            self.setFavorites();
        }
    };

    this.isInFavorites = function (element) {
        if (self._favorites[element.category.id + '-' + element.id]) {
            return true;
        }

        return false;
    };

    this.removeAFavorite = function (element) {
        if (self._favorites[element.category.id + '-' + element.id]) {
            delete self._favorites[element.category.id + '-' + element.id];
            self.setFavorites();
        }
    };
}

module.exports = {
    favoritesService: favoritesService
};