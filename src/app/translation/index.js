'use strict';

angular.module('rando.translation', ['pascalprecht.translate'])
    .service('translationService', require('./services').translationService)
    .controller('TranslationController', require('./controllers').TranslationController)
    .directive('translationMenu', require('./directives').translationMenuDirective)
    .config(require('./configs').translationConfig);
