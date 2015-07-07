'use strict';

var controllers = require('./controllers');

function translationMenuDirective() {
    return {
        restrict: 'E',
        replace: true,
        template: require('./templates/translation-menu.html'),
        controller: 'TranslationController'
    };
}

module.exports = {
    translationMenuDirective: translationMenuDirective
};
