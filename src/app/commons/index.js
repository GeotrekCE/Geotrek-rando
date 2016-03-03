'use strict';

angular.module('rando.commons', [])
.factory('utilsFactory', require('./factories').utilsFactory)
.filter('removeTags', require('./filters').removeTags)
.filter('decodeEntities', require('./filters').decodeEntities)
.filter('isSVG', require('./filters').isSVG)
.filter('sanitizeData', require('./filters').sanitizeData)
.filter('hexToRgb', require('./filters').hexToRgb)
.directive('a', require('./directives').a)
.directive('clickAnywhereButHere', require('./directives').clickAnywhereButHere);
