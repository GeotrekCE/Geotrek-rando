'use strict';

function poisListeDirective() {
    return {
        restrict: 'E',
        replace: true,
        //scope: false,
        template: require('./templates/pois-results.html'),
        controller: 'PoisListeController'
    };
}

module.exports = {
    poisListeDirective: poisListeDirective
};
