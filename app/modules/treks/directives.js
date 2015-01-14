'use strict';

var controllers = require('./controllers');

function treksListeDirective() {
    return {
        restrict: 'E',
        transclude: true,
        template: require('./templates/treks-liste.html'),
        controller: controllers.TreksListeController
    };
}

module.exports = {
    treksListeDirective: treksListeDirective
};
