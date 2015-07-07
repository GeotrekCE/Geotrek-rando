'use strict';

function socialMenuDirective() {
    return {
        restrict: 'E',
        replace: true,
        //scope: false,
        template: require('./templates/social-menu.html'),
        controller: 'SocialController'
    };
}

module.exports = {
    socialMenuDirective: socialMenuDirective
};
