'use strict';

function translateFavorites($translateProvider) {
    $translateProvider.translations('fr', {
        'FAVORITES': 'Favoris',
        'NO_FAVORITES': 'Vous n\'avez pas encore de favoris !'
    });

    $translateProvider.translations('en', {
        'FAVORITES': 'Favorites',
        'NO_FAVORITES': 'You still don\'t have any favorites element !'
    });
}

module.exports = {
    translateFavorites: translateFavorites
};