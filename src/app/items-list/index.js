'use strict'

angular.module('rando.items', [])
    .controller('ItemsListController', require('./controllers').ItemsListController)
    .directive('itemsList', require('./directives').itemsListDirective);
