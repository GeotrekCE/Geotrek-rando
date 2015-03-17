'use strict';

var angular = require('angular');

angular.module('rando.home', [])
    .controller('HomeController', require('./controllers').HomeController)
    .directive('homePage', require('./directives').homePage);