'use strict';

angular.module('rando.social', [])
    .service('facebookService', require('./services').facebookService)
    .controller('SocialController', require('./controllers').SocialController)
    .directive('socialMenu', require('./directives').socialMenuDirective);
