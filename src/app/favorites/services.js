'use strict';

function favoritesService(globalSettings) {

    var self = this,
        storageName = globalSettings.PLATFORM_ID + '-favorites';

    this.getFavorites = function () {
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

    this.setFavorites = function () {
        var favorites_json = JSON.stringify(self._favorites);
        localStorage.setItem(storageName, favorites_json);
    };

    this.removeAllFavorites = function () {
        self._favorites = {};
        localStorage.removeItem(storageName);
    };

    this.addAFavorite = function (element) {
        if (!self._favorites[element.uid]) {
            self._favorites[element.uid] = {
                id: element.id,
                category: element.properties.category.id
            };
            self.setFavorites();
        }
    };

    this.isInFavorites = function (element) {
        if (element) {
            if (self._favorites && self._favorites[element.uid]) {
                return true;
            }
        }

        return false;
    };

    this.removeAFavorite = function (element) {
        if (self._favorites[element.uid]) {
            delete self._favorites[element.uid];
            self.setFavorites();
        }
    };
}

module.exports = {
    favoritesService: favoritesService
};