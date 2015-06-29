'use strict';

var controller = require('./controllers');

function layoutRoutes($locationProvider, $stateProvider, $urlRouterProvider, globalSettings) {

    if (globalSettings.ENABLE_HTML_MODE) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: true
        });
    }

    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('layout', {
            abstract: true,
            url: '/',
            template: require('./templates/layout.html'),
            controller: controller.LayoutController
        })
        .state('layout.root', {
            url: '',
            views: {
                'sidebar' : {
                    template: require('./templates/sidebar-home.html'),
                    controller: controller.SidebarHomeController
                },
                'content' : {
                    template: require('./templates/content-home.html'),
                }
            }

        })
        .state('layout.flat', {
            url: 'informations/:flatID/',
            views: {
                'sidebar' : {
                    template: require('./templates/sidebar-flat.html'),
                    controller: controller.SidebarFlatController
                },
                'content' : {
                    template: require('./templates/content-flat.html'),
                }
            }
        })
        .state('layout.detail', {
            url: ':catSlug/:slug/',
            views: {
                'sidebar' : {
                    template: require('./templates/sidebar-detail.html'),
                    controller: controller.SidebarDetailController
                },
                'content' : {
                    template: require('./templates/content-detail.html'),
                }
            }
        });
}

module.exports = {
    layoutRoutes: layoutRoutes
};