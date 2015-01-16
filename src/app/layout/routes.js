'use strict';

var controller = require('./controllers');

function layoutRoutes($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('layout', {
            abstract: true,
            template: require('./templates/layout.html'),
            controller: controller.LayoutController
        })
        .state('root', {
            parent: 'layout',
            url: '/',
            views: {
                'header' : {
                    template: require('./templates/header.html'),
                    controller: controller.HeaderController
                },
                'sidebar' : {
                    template: require('./templates/sidebar.html'),
                    controller: controller.SidebarController
                },
                'content' : {
                    template: require('./templates/content-home.html'),
                },
                'footer' : {
                    template: require('./templates/footer.html'),
                    controller: controller.FooterController
                },
            }

        });
}

module.exports = {
    layoutRoutes: layoutRoutes
};