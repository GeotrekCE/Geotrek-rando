'use strict';

var controllers = require('./controllers');

function poisListeDirective() {
    return {
        restrict: 'E',
        replace: true,
        //scope: false,
        template: require('./templates/pois-results.html'),
        controller: controllers.PoisListeController
    };
}

module.exports = {
    poisListeDirective: poisListeDirective
};
