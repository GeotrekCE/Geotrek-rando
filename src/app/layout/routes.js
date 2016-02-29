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
            resolve: {
                CheckAPI: function($q, $http, globalSettings, settingsFactory, translationService, utilsFactory) {
                    var lang = translationService.getCurrentLang(),
                        url  = settingsFactory.paramsUrl.replace(/\$lang/, lang),
                        requiredAPIversion = globalSettings.REQUIRED_API_VERSION;

                    if (!requiredAPIversion) {
                        return 'REQUIRED_API_VERSION is not defined in settings';
                    }

                    return $http({url: url})
                        .then(function (response) {
                            if (String(response.status).charAt(0) !== '2') {
                                return 'Unable to get API data (' + response.status + ').';
                            }
                            var isRequiredAPIversion = utilsFactory.versionCompare(response.data.geotrek_admin_version, requiredAPIversion);

                            if ((isRequiredAPIversion >= 0) !== true) {
                                return 'Geotrek-Rando required API data generated with Geotrek-Admin >= 2.9.3';
                            }
                        }, function(error) {
                            return error;
                        });
                }
            },
            controller: 'LayoutController'
        })
        .state('error', {
            url: '',
            params: {message: 'Unknown error'},
            template: '<h3>Error : {{message}}</h3>',
            controller: function($scope, $stateParams) {
                $scope.message = $stateParams.message;
            }
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
            url: ':catSlug/:slug/',
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
