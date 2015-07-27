'use strict';

function favoritesService(globalSettings) {
    var that = this;
    var storageName = globalSettings.PLATFORM_ID + '-favorites';
    that.serviceCallbacks = [];

    that.getFavorites = function () {
        if (that._favorites) {
            return that._favorites;
        }

        if (!localStorage.getItem(storageName)) {
            that._favorites = {};
            that.setFavorites();
        } else {
            var favorites_json = localStorage.getItem(storageName);
            that._favorites = JSON.parse(favorites_json);
        }

        return that._favorites;
    };

    that.setFavorites = function () {
        var favorites_json = JSON.stringify(that._favorites);
        localStorage.setItem(storageName, favorites_json);
    };

    that.removeAllFavorites = function () {
        that._favorites = {};
        localStorage.removeItem(storageName);
    };

    that.addAFavorite = function (element) {
        if (!that._favorites[element.uid]) {
            that._favorites[element.uid] = {
                id: element.id,
                category: element.properties.category.id
            };
            that.setFavorites();
            that.callCallbacks();
        }
    };

    that.isInFavorites = function (element) {
        if (element) {
            if (that._favorites && that._favorites[element.uid]) {
                return true;
            }
        }

        return false;
    };

    that.removeAFavorite = function (element) {
        if (that._favorites[element.uid]) {
            delete that._favorites[element.uid];
            that.setFavorites();
            that.callCallbacks();
        }
    };

    that.addCallback = function (callbackFunction) {
        that.serviceCallbacks.push(callbackFunction);
    };

    that.callCallbacks = function () {
        that.serviceCallbacks.forEach(function (callbackFunction) {
            callbackFunction(that._favorites);
        });
    };
}

module.exports = {
    favoritesService: favoritesService
};