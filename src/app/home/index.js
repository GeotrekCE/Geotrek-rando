'use strict';

var angular = require('angular');

angular.module('rando.home', [])
    .controller('HomeController', require('./controllers').HomeController)
    .service('homeService', require('./services').homeService)
    .directive('homePage', require('./directives').homePage);