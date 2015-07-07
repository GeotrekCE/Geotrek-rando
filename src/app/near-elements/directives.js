'use strict';

function nearListeDirective() {
    return {
        restrict: 'E',
        replace: true,
        //scope: false,
        template: require('./templates/near-elements.html'),
        controller: 'NearListeController'
    };
}

module.exports = {
    nearListeDirective: nearListeDirective
};
