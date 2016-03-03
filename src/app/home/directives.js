'use strict';

function homePage(globalSettings, translationService) {
    var currentLang = translationService.getCurrentLang();
    var tpl         = globalSettings.HOME_TEMPLATE_FILE[currentLang];
    var directive   = {
        restrict: 'E',
        replace: true,
        scope: true,
        controller: 'HomeController'
    };

    if (tpl && tpl.length) {
        directive.templateUrl = 'app/custom/templates/' + tpl;
    } else {
        directive.template = require('./templates/home-default.html');
    }

    return directive;
}

function randomContentsList() {
    return {
        restrict: 'E',
        replace: true,
        template: require('./templates/random-contents-list.html'),
        scope: {
            categories: '@',
            quantity: '@'
        },
        controller: 'RandomContentsListWidgetController'
    };
}

function randomContent() {
    return {
        restrict: 'E',
        replace: true,
        template: require('./templates/random-content.html'),
        scope: {
            category: '@'
        },
        controller: 'RandomContentWidgetController'
    };
}

module.exports = {
    homePage: homePage,
    randomContentsList: randomContentsList,
    randomContent: randomContent
};
