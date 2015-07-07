'use strict';

angular.module('rando.footer', [])
    .controller('FooterController', require('./controllers').FooterController)
    .directive('geotrekFooter', require('./directives').footerDirective);
