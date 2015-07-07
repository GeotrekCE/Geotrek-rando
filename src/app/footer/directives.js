'use strict';

function footerDirective() {
    return {
        restrict: 'E',
        replace: true,
        scope: true,
        template: require('./templates/footer-base.html'),
        controller: 'FooterController'
    };
}

module.exports = {
    footerDirective: footerDirective
};
