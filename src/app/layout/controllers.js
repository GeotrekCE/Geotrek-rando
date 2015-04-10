'use strict';

function LayoutController($rootScope, $scope, $state, $location, resultsService, globalSettings, homeService, $translate, $timeout) {
    $rootScope.currentState_name = $state.current.name;
    $rootScope.showFooterOnApp = globalSettings.SHOW_FOOTER;
    if ($state.current.name === 'layout.root') {
        if (globalSettings.SHOW_HOME) {
            $rootScope.showHome = !homeService.getChoice();
        }
    } else {
        $rootScope.showHome = false;
    }

    function setSharingIfNotDetail() {
        if ($state.current.name !== 'layout.detail') {
            $rootScope.twitterTags = [
                {
                    name: "twitter:card",
                    content: "summary_large_image"
                },
                {
                    name: "twitter:site",
                    content: globalSettings.TWITTER_ID
                },
                {
                    name: "twitter:creator",
                    content: globalSettings.TWITTER_ID
                },
                {
                    name: "twitter:description",
                    content: "Description"
                },
                {
                    name: "twitter:image:src",
                    content: globalSettings.DOMAIN + "/images/custom/home/head.jpg"
                }

            ];

            $rootScope.facebookTags = [
                {
                    property: "og:type",
                    content: "article"
                },
                {
                    property: "og:url",
                    content: $location.absUrl
                },
                {
                    property: "og:image",
                    content: globalSettings.DOMAIN + "/images/custom/home/head.jpg"
                },
                {
                    property: "og:description",
                    content: "Description"
                }
            ];

            $translate('BANNER_TEXT')
                .then(
                    function (translation) {
                        var platformTitleFb = {
                            property: "og:title",
                            content: translation
                        };
                        var platformTitleTw = {
                            name: "twitter:title",
                            content: translation
                        };
                        $rootScope.facebookTags.push(platformTitleFb);
                        $rootScope.twitterTags.push(platformTitleTw);
                    }
                );
        }
    }

    $rootScope.$on("$stateChangeSuccess",  function (event, toState, toParams, fromState, fromParams) {
        // to be used for back button //won't work when page is reloaded.
        $rootScope.previousState_name = fromState.name;
        $rootScope.currentState_name = toState.name;

        setSharingIfNotDetail();
    });
    //back button function called from back button's ng-click="back()"
    $rootScope.back = function () {
        if (!$rootScope.previousState_name || $rootScope.previousState_name !== 'layout.root') {
            $state.go('layout.root');
        } else {
            window.history.back();
        }
    };

    $rootScope.$on('startSwitchGlobalLang', function () {
        resultsService.getAllResults(true)
            .then(
                function () {
                    $rootScope.$emit('switchGlobalLang');
                }
            );
    });

    $rootScope.mapIsShown = false;

    $timeout(setSharingIfNotDetail, 1000);
}

function HeaderController($rootScope, $scope, globalSettings) {

    $scope.displayHomePage = function () {
        $rootScope.showHome = true;
    };

    $scope.isHomeActive = globalSettings.SHOW_HOME;

    $scope.logo = globalSettings.LOGO_FILE;

}

function SidebarHomeController() {
}

function SidebarDetailController($scope, $rootScope, $modal, $stateParams, $location, globalSettings, resultsService, favoritesService) {

    function getResultDetails(refresh) {
        if ($stateParams.slug) {
            resultsService.getAResultBySlug($stateParams.slug)
                .then(
                    function (data) {
                        $scope.result = data;

                        $rootScope.twitterTags = [
                            {
                                name: "twitter:site",
                                content: globalSettings.TWITTER_ID
                            },
                            {
                                name: "twitter:creator",
                                content: globalSettings.TWITTER_ID
                            },
                            {
                                name: "twitter:title",
                                content: data.properties.name
                            },
                            {
                                name: "twitter:description",
                                content: data.properties.description_teaser
                            }

                        ];

                        $rootScope.facebookTags = [
                            {
                                property: "og:type",
                                content: "article"
                            },
                            {
                                property: "og:url",
                                content: $location.absUrl
                            },
                            {
                                property: "og:title",
                                content: data.properties.name
                            },
                            {
                                property: "og:description",
                                content: data.properties.description_teaser
                            }
                        ];

                        if (data.properties.pictures.length > 1) {
                            var length = data.properties.pictures.length <= 4 ? data.properties.pictures.length : 4,
                                i = 0,
                                cardType = {
                                    name: "twitter:card",
                                    content: "gallery"
                                };

                                $rootScope.twitterTags.push(cardType)
                            for (i = 0; i < length; i++) {
                                var currentImg = {
                                    name: "twitter:image" + i,
                                    content: data.properties.pictures[i].url
                                };
                                $rootScope.twitterTags.push(currentImg);
                            }
                        } else if (data.properties.pictures[0]) {
                            var cardType = {
                                name: "twitter:card",
                                content: "summary_large_image"
                            };
                            var cardImg = {
                                name: "twitter:image:src",
                                content: data.properties.pictures[0].url
                            };
                            $rootScope.twitterTags.push(cardImg);
                        }

                        if (data.properties.pictures[0]) {
                            var fbImg = {
                                property: "og:image",
                                content: data.properties.pictures[0].url
                            };
                            $rootScope.facebookTags.push(fbImg);
                        }
                    }
                );
        }
    }

    $scope.toggleFavorites = function (currentElement) {
        var currentAction = '';
        if (favoritesService.isInFavorites(currentElement)) {
            currentAction = 'remove';
        } else {
            currentAction = 'add';
        }
        $rootScope.$broadcast('changeFavorite', {element: currentElement, action: currentAction});
    };

    $scope.show3d = function () {
        var modal = $modal.open({
            templateUrl: '/app/3d/templates/rando-3d.html',
            controller: 'Rando3DController',
            resolve: {
                result: function () {
                    return $scope.result;
                }
            }
        });
    };

    $scope.isInFavorites = favoritesService.isInFavorites;

    $scope.back = $rootScope.back;

    getResultDetails();

}

function SidebarFlatController() {

}

function FooterController() {
}


module.exports = {
    LayoutController: LayoutController,
    HeaderController: HeaderController,
    SidebarHomeController: SidebarHomeController,
    SidebarDetailController: SidebarDetailController,
    SidebarFlatController: SidebarFlatController,
    FooterController: FooterController
};