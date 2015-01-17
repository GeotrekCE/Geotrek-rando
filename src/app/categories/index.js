'use strict';

angular.module('rando.categories', [])
    .service('categoriesService', require('./services').categoriesService)
    .controller('CategoriesListeController', require('./controllers').CategoriesListeController)
    .directive('categoriesListe', require('./directives').categoriesListeDirective);