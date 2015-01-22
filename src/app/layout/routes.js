'use strict';

var controller = require('./controllers');

function layoutRoutes($locationProvider, $stateProvider, $urlRouterProvider) {

    /*$locationProvider.html5Mode({
        enabled: true,
        requireBase: true
    });*/

    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('layout', {
            abstract: true,
            url: '/',
            template: require('./templates/layout.html'),
            controller: controller.LayoutController
        })
        .state('layout.root', {
            parent: 'layout',
            url: '',
            views: {
                'header' : {
                    template: require('./templates/header.html'),
                    controller: controller.HeaderController
                },
                'sidebar' : {
                    template: require('./templates/sidebar-home.html'),
                    controller: controller.SidebarHomeController
                },
                'content' : {
                    template: require('./templates/content-home.html'),
                },
                'footer' : {
                    template: require('./templates/footer.html'),
                    controller: controller.FooterController
                }
            }

        })
        .state('layout.detail', {
            parent: 'layout',
            url: ':slug/',
            views: {
                'header' : {
                    template: require('./templates/header.html'),
                    controller: controller.HeaderController
                },
                'sidebar' : {
                    template: require('./templates/sidebar-detail.html'),
                    controller: controller.SidebarController
                },
                'content' : {
                    template: require('./templates/content-detail.html'),
                },
                'footer' : {
                    template: require('./templates/footer.html'),
                    controller: controller.FooterController
                }
            }
        });
}

module.exports = {
    layoutRoutes: layoutRoutes
};