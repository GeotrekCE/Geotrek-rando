'use strict';

angular.module('rando.commons', [])
.factory('utilsFactory', require('./factories').utilsFactory)
.directive('a', require('./directives').a);
