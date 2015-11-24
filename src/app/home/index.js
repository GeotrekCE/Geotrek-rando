'use strict';

angular.module('rando.home', [])
    .controller('HomeController', require('./controllers').HomeController)
    .controller('RandomContentsListWidgetController', require('./controllers').RandomContentsListWidgetController)
    .controller('RandomContentWidgetController', require('./controllers').RandomContentWidgetController)
    .service('homeService', require('./services').homeService)
    .directive('homePage', require('./directives').homePage)
    .directive('randomContentsList', require('./directives').randomContentsList)
    .directive('randomContent', require('./directives').randomContent);
