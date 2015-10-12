'use strict';

angular.module('rando.home', [])
    .controller('HomeController', require('./controllers').HomeController)
    .controller('RandomWidgetController', require('./controllers').RandomWidgetController)
    .service('homeService', require('./services').homeService)
    .directive('homePage', require('./directives').homePage)
    .directive('randomContent', require('./directives').randomContent);
