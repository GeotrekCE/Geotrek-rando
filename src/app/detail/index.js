'use strict';

angular.module('rando.detail', ['ui.bootstrap'])
    .controller('DetailController', require('./controllers').DetailController)
    .directive('detailPage', require('./directives').detailDirective)
    .directive('detailContent', require('./directives').detailContent);