'use strict';

function favoritesService(globalSettings) {

    var self = this,
        storageName = globalSettings.PLATFORM_ID + '-favorites';

    this.getFavorites = function getFavorites () {
        if (self._favorites) {
            return self._favorites;
        }

        if (!localStorage.getItem(storageName)) {
            self._favorites = {};
            self.setFavorites();
        } else {
            var favorites_json = localStorage.getItem(storageName);
            self._favorites = JSON.parse(favorites_json);
        }

        return self._favorites;
    };

    this.setFavorites = function setFavorites () {
        var favorites_json = JSON.stringify(self._favorites);
        localStorage.setItem(storageName, favorites_json);
    };

    this.removeAllFavorites = function removeAllFavorites () {
        self._favorites = {};
        localStorage.removeItem(storageName);
    };

    this.addAFavorite = function addAFavorite (element) {
        if (!self._favorites[element.uid]) {
            self._favorites[element.uid] = {
                id: element.id,
                category: element.properties.category.id
            };
            self.setFavorites();
        }
    };

    this.isInFavorites = function isInFavorites (element) {
        if (element) {
            if (self._favorites && self._favorites[element.uid]) {
                return true;
            }
        }

        return false;
    };

    this.removeAFavorite = function removeAFavorite (element) {
        if (self._favorites[element.uid]) {
            delete self._favorites[element.uid];
            self.setFavorites();
        }
    };
}

module.exports = {
    favoritesService: favoritesService
};