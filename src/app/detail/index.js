'use strict';

angular.module('rando.detail', ['ui.bootstrap'])
    .controller('DetailController', require('./controllers').DetailController)
    .directive('detailPage',    require('./directives').detailDirective)
    .directive('detailContent', require('./directives').detailContent)
    .directive('detailContentMeta', require('./directives').detailContentMeta)
    .directive('detailAside',   require('./directives').detailAside);
