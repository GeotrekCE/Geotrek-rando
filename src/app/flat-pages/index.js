'use strict';

var angular = require('angular');

angular.module('rando.flat', [])
    .service('flatService', require('./services').flatService)
    .controller('FlatPagesController', require('./controllers').FlatPagesController)
    .directive('flatMenu', require('./directives').flatMenu)
    .directive('flatPage', require('./directives').flatPage);