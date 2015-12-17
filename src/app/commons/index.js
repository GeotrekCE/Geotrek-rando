'use strict';

angular.module('rando.commons', [])
.factory('utilsFactory', require('./factories').utilsFactory)
.filter('removeTags', require('./filters').removeTags)
.directive('a', require('./directives').a);
