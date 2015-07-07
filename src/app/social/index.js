'use strict';

angular.module('rando.social', [])
    .controller('SocialController', require('./controllers').SocialController)
    .directive('socialMenu', require('./directives').socialMenuDirective);
