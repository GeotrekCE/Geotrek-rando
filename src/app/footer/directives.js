'use strict';

var controllers = require('./controllers');

function footerDirective() {
    return {
        restrict: 'E',
        replace: true,
        scope: true,
        template: require('./templates/footer-base.html'),
        controller: controllers.FooterController
    };
}

module.exports = {
    footerDirective: footerDirective
};