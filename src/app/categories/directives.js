'use strict';

var controllers = require('./controllers');

function categoriesListeDirective() {
    return {
        restrict: 'E',
        replace: true,
        template: require('./templates/categories-liste.html'),
        controller: controllers.CategoriesListeController
    };
}

module.exports = {
    categoriesListeDirective: categoriesListeDirective
};