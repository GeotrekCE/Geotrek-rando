'use strict';

var controllers = require('./controllers');

angular.module('rando.layout', ['ui.router', 'rando.treks', 'angular-google-analytics'])
    .controller('LayoutController',        controllers.LayoutController)
    .controller('SidebarHomeController',   controllers.SidebarHomeController)
    .controller('SidebarFlatController',   controllers.SidebarFlatController)
    .controller('SidebarDetailController', controllers.SidebarDetailController)
    .config(require('./routes').layoutRoutes)
    .config(require('./analytics').AnalyticsConfig)
    .run(['Analytics', function (Analytics) {}]) // !!! Analytics needs to be injected once in order to be active !!!
    .run(require('./services').RunApp);
