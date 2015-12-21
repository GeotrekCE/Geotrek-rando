'use strict';

angular.module('rando.commons', [])
.factory('utilsFactory', require('./factories').utilsFactory)
.filter('removeTags', require('./filters').removeTags)
.filter('isSVG', require('./filters').isSVG)
.directive('a', require('./directives').a);
