'use strict';

function translateDetails($translateProvider) {
    $translateProvider.translations('fr', {
        'START': 'Départ :',
        'ARRIVAL': 'Arrivée :',
        'LOOP': 'Boucle :',
        'PARK_CENTERED': 'Cet itinéraire est dans le coeur du parc national, veuillez consulter la réglementation.',
        'TRANSPORT': 'Transports',
        'ACCESS': 'Accès routiers',
        'INFORMATION_DESKS': 'Points d\'information',
        'CONTACT': 'Contact',
        'KNOW_MORE': 'En savoir plus',
        'POI': 'Patrimoine',
        'NEAR': 'A proximité'
    });

    $translateProvider.translations('en', {
        'START': 'Start:',
        'ARRIVAL': 'Arrival:',
        'LOOP': 'Loop:',
        'PARK_CENTERED': 'This trek is park centered, please have a look at the rules page.',
        'TRANSPORT': 'Transports',
        'ACCESS': 'Access',
        'INFORMATION_DESKS': 'Information desks',
        'CONTACT': 'Contact',
        'KNOW_MORE': 'Know more',
        'POI': 'POIS',
        'NEAR': 'Close from here'

    });
}

module.exports = {
    translateDetails: translateDetails
};