'use strict';

angular.module('rando.header', [])
    .controller('headerController', require('./controllers').headerController)
    .directive('randoHeader', require('./directives').randoHeader)
    .directive('closeCollapse', require('./directives').closeCollapse);
