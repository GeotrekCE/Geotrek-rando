'use strict';

function translateFilters($translateProvider) {
    $translateProvider.translations('fr', {
        'DISTRICTS': 'Communes',
        'SEARCH': 'Rechercher',
        'AREAS': 'Vallées'
    });

    $translateProvider.translations('en', {
        'DISTRICTS': 'Districts',
        'SEARCH': 'Search',
        'AREAS': 'Areas'
    });
}

module.exports = {
    translateFilters: translateFilters
};