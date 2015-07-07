'use strict';

angular.module('rando.flat', [])
    .service('flatService', require('./services').flatService)
    .controller('FlatPagesController', require('./controllers').FlatPagesController)
    .controller('FlatMenuController',  require('./controllers').FlatMenuController)
    .directive('flatMenu', require('./directives').flatMenu)
    .directive('flatPage', require('./directives').flatPage);
