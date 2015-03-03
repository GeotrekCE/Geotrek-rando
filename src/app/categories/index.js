'use strict';

var angular = require('angular');

angular.module('rando.categories', ['pascalprecht.translate'])
    .config(require('./lang').translateCategories)
    .service('categoriesService', require('./services').categoriesService)
    .controller('CategoriesListeController', require('./controllers').CategoriesListeController)
    .directive('categoriesListe', require('./directives').categoriesListeDirective);