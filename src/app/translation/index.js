'use strict';

angular.module('rando.translation', ['pascalprecht.translate'])
    .service('translationService', require('./services').translationService)
    .controller('TranslationController', require('./controllers').TranslationController)
    .directive('translationMenu', require('./directives').translationMenuDirective)
    .directive('translationMenuSimple', require('./directives').translationMenuDirectiveSimple)
    .config(require('./configs').translationConfig);
