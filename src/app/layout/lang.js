'use strict';

function translateLayout($translateProvider) {
    $translateProvider.translations('fr', {
        'HEADER': {
            'TOGGLE_NAV': 'Ouvrir le menu',
            'BANNER_TEXT': 'Destination Parc national des Cévennes',
            'ABOUT_US': 'En savoir plus',
            'SHARE': 'Partager',
            'FAVORITES': 'Favoris'
        },
        'SIDEBAR': {
            'BACK': 'Retour à la carte',
            'PRINT': 'Imprimer la fiche',
            'ADD_FAVS': 'Ajouter à mes favoris',
            'REMOVE_FAVS': 'Retirer de mes favoris',
            'SHARE': 'Partager',
            'WARNING': 'Signaler un problème ou une erreur',
            'KML': 'Télécharger la fiche KML',
            'GPX': 'Télécharger la fiche GPX',
            '3D': 'Voir l\'itinéraire en 3D'
        }
    });

    $translateProvider.translations('en', {
        'HEADER': {
            'TOGGLE_NAV': 'Toggle navigation',
            'BANNER_TEXT': 'Destination Parc national des Cévennes',
            'ABOUT_US': 'About us',
            'SHARE': 'Share',
            'FAVORITES': 'Favorites'
        },
        'SIDEBAR': {
            'BACK': 'Back to the map',
            'PRINT': 'Print',
            'ADD_FAVS': 'Add to favorites',
            'REMOVE_FAVS': 'Remove from favorites',
            'SHARE': 'Share',
            'WARNING': 'Signal an issue or a mistake',
            'KML': 'Download KML file',
            'GPX': 'Download GPX file',
            '3D': '3D visualisation'
        }
    });
}

module.exports = {
    translateLayout: translateLayout
};