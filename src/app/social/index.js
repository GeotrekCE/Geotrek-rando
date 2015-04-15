'use strict';

var angular = require('angular');

angular.module('rando.social', [])
    .controller('SocialController', require('./controllers').SocialController)
    .directive('socialMenu', require('./directives').socialMenuDirective);