'use strict';

var controllers = require('./controllers');

function nearListeDirective() {
    return {
        restrict: 'E',
        replace: true,
        //scope: false,
        template: require('./templates/near-elements.html'),
        controller: controllers.NearListeController
    };
}

module.exports = {
    nearListeDirective: nearListeDirective
};
