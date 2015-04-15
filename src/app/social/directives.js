'use strict';

var controllers = require('./controllers');

function socialMenuDirective() {
    return {
        restrict: 'E',
        replace: true,
        //scope: false,
        template: require('./templates/social-menu.html'),
        controller: controllers.SocialController
    };
}

module.exports = {
    socialMenuDirective: socialMenuDirective
};
