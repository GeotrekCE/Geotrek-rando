'use strict';

function translateCategories($translateProvider, globalSettings) {
    $translateProvider.translations('fr', {
        'FILTERS_NAMES': {
            'CHECKBOX': {
                'ROUTES': 'Parcours'
            },
            'RANGE' : {
                'DIFFICULTIES': 'Difficultée :',
                'DURATION': 'Durée :',
                'ASCENT': 'Dénivelé :'
            }
        },
        'FILTERS_VALUES': {
            'ALL': 'Toutes'
        }
    });

    $translateProvider.translations('en', {
        'FILTERS_NAMES': {
            'CHECKBOX': {
                'ROUTES': 'Routes'
            },
            'RANGE': {
                'DIFFICULTIES': 'Difficulty:',
                'DURATION': 'Duration:',
                'ASCENT': 'Ascent:'
            }
        },
        'FILTERS_VALUES': {
            'ALL': 'All'
        }
    });

    $translateProvider.preferredLanguage(globalSettings.DEFAULT_LANGUAGE);
}

module.exports = {
    translateCategories: translateCategories
};