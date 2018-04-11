'use strict';

function layoutRoutes($locationProvider, $stateProvider, $urlRouterProvider, globalSettings) {

    if (globalSettings.ENABLE_HTML_MODE) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    }

    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('layout', {
            abstract: true,
            url: '/',
            template: require('./templates/layout.html'),
            controller: 'LayoutController'
        })
        .state('layout.root', {
            url: '',
            views: {
                'sidebar' : {
                    template: require('./templates/sidebar-home.html'),
                    controller: 'SidebarHomeController'
                },
                'content' : {
                    template: require('./templates/content-home.html')
                }
            }

        })
        .state('layout.flat', {
            url: 'informations/:flatID/',
            views: {
                'sidebar' : {
                    template: require('./templates/sidebar-flat.html'),
                    controller: 'SidebarFlatController'
                },
                'content' : {
                    template: require('./templates/content-flat.html')
                }
            }
        })
        .state('layout.detail', {
            // The 'elementUID' parameter is optional. If omitted, catSLug and slug
            // parameters will be used to search for the page to be displayed, but
            // it may fail at showing the right page if several elements have the same
            // couple catSlug+slug.
            url: ':catSlug/:slug/:elementUID?/',
            views: {
                'sidebar' : {
                    template: require('./templates/sidebar-detail.html'),
                    controller: 'SidebarDetailController'
                },
                'content' : {
                    template: require('./templates/content-detail.html')
                }
            }
        });
}

module.exports = {
    layoutRoutes: layoutRoutes
};
