'use strict';

angular.module('rando.categories', ['ui.bootstrap'])
    .service('categoriesService', require('./services').categoriesService)
    .controller('CategoriesListeController', require('./controllers').CategoriesListeController)
    .directive('categoriesListe', require('./directives').categoriesListeDirective);
