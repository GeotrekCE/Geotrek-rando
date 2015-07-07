'use strict';

function categoriesListeDirective() {
    return {
        restrict: 'E',
        replace: true,
        template: require('./templates/categories-liste.html'),
        controller: 'CategoriesListeController'
    };
}

module.exports = {
    categoriesListeDirective: categoriesListeDirective
};
