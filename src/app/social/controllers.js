'use strict';

function SocialController($scope, $filter, $rootScope, $location, $state, $stateParams, $translate, resultsService, flatService, globalSettings, facebookService) {

    $scope.shareIcon = (globalSettings.SHARE_ICON ? globalSettings.SHARE_ICON : 'share-alt');

    function initShareButtons(translatedContent, element) {
        var fbOptions;

        $scope.twitterShareLink = 'https://twitter.com/share?url=' + encodeURIComponent($location.absUrl()) + '&';

        if (element) {
            fbOptions = {
                method: 'share',
                href: $location.absUrl(),
                redirect_uri: $location.absUrl(),
                display: 'popup',
            };

            $scope.shareToFacebook = function() {
                facebookService.share(fbOptions);
            };

            $scope.twitterShareLink += 'text=' + encodeURIComponent(element.properties.name);

            $scope.mailShareLink = 'mailto:?Subject=' + encodeURIComponent(element.properties.name) + '&Body=' + encodeURIComponent($filter('decodeEntities')(element.properties.description_teaser)) + '%0D%0A' + encodeURIComponent($location.absUrl());

        } else {
            fbOptions = {
                method: 'share',
                href: $location.absUrl(),
                redirect_uri: translatedContent.BANNER_TEXT,
                display: 'popup'
            };

            $scope.shareToFacebook = function() {
                facebookService.share(fbOptions);
            };

            $scope.twitterShareLink += 'text=' + encodeURIComponent(translatedContent.SHARING_DEFAULT_TEXT);

            $scope.mailShareLink = 'mailto:?Subject=' + encodeURIComponent(translatedContent.BANNER_TEXT) + '&Body=' + encodeURIComponent(translatedContent.SHARING_DEFAULT_TEXT) + '%0D%0A' + encodeURIComponent($location.absUrl());

        }

        if (globalSettings.TWITTER_ID) {
            $scope.twitterShareLink += '&related=' + globalSettings.TWITTER_ID;
        }
    }

    function initHomeMetaTags(translatedContent) {
        $rootScope.twitterTags = [
            {
                name: "twitter:card",
                content: "summary_large_image"
            },
            {
                name: "twitter:title",
                content: translatedContent.BANNER_TEXT
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
                content: translatedContent.SHARING_DEFAULT_TEXT
            },
            {
                name: "twitter:image:src",
                content: globalSettings.API_URL + "/custom/images/" + globalSettings.DEFAULT_SHARE_IMG
            }

        ];

        $rootScope.facebookTags = [
            {
                property: "og:type",
                content: "article"
            },
            {
                property: "og:title",
                content: translatedContent.BANNER_TEXT
            },
            {
                property: "og:url",
                content: $location.absUrl
            },
            {
                property: "og:image",
                content: globalSettings.API_URL + "/custom/images/home/head.jpg"
            },
            {
                property: "og:description",
                content: translatedContent.SHARING_DEFAULT_TEXT
            }
        ];
    }

    function initDetailMetaTags(data) {
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

        var cardType = {};
        if (data.properties.pictures[1]) {
            var length = data.properties.pictures.length <= 4 ? data.properties.pictures.length : 4,
                i = 0;

            cardType = {
                name: "twitter:card",
                content: "gallery"
            };

            $rootScope.twitterTags.push(cardType);
            for (i = 0; i < length; i++) {
                $rootScope.twitterTags.push({
                    name: "twitter:image" + i,
                    content: data.properties.pictures[i].url
                });
            }
        } else {
            cardType = {
                name: "twitter:card",
                content: "summary_large_image"
            };
            var img = '';

            if (data.properties.pictures[0]) {
                img = data.properties.pictures[0].url;
            } else {
                img = globalSettings.API_URL + "/custom/images/" + globalSettings.DEFAULT_SHARE_IMG;
            }

            var cardImg = {
                name: "twitter:image:src",
                content: img
            };
            $rootScope.twitterTags.push(cardType);
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

    function initShareOnTranslate() {
        $translate(['BANNER_TEXT', 'SHARING_DEFAULT_TEXT'])
            .then(
                function (translation) {
                    if ($state.current.name === 'layout.flat') {
                        flatService.getAFlatPage($stateParams.flatID)
                            .then(
                                function (data) {
                                    var flatElement = {
                                        BANNER_TEXT: data.title,
                                        SHARING_DEFAULT_TEXT: translation.SHARING_DEFAULT_TEXT
                                    };
                                    initShareButtons(flatElement);
                                    initHomeMetaTags(flatElement);
                                },
                                function (err) {
                                    if (console) {
                                        console.error(err);
                                    }
                                }
                            );
                    } else {
                        initShareButtons(translation);
                        initHomeMetaTags(translation);
                    }
                },
                function (err) {
                    if (console) {
                        console.error(err);
                    }
                }
            );
    }

    function initShare() {
        var currentTitle = '';

        if ($state.current.name === 'layout.detail') {
            resultsService.getAResultBySlug($stateParams.slug, $stateParams.catSlug)
                .then(
                    function (data) {
                        currentTitle = data.properties.name;
                        initDetailMetaTags(data);
                        initShareButtons(currentTitle, data);
                    },
                    function (err) {
                        if (console) {
                            console.error(err);
                        }
                    }
                );
        }

        else {
            initShareOnTranslate();
        }
    }

    $scope.showSocialMenu = false;
    $scope.toggleSocialMenu = function toggleSocialMenu() {
        $scope.showSocialMenu = !$scope.showSocialMenu;
    };

    initShare();

    var rootScopeEvents = [
        $rootScope.$on('$stateChangeSuccess', initShare),
        $rootScope.$on('translationReady', initShareOnTranslate),
        $rootScope.$on('startSwitchGlobalLang', initShareOnTranslate)
    ];

    $scope.$on('$destroy', function () { rootScopeEvents.forEach(function (dereg) { dereg(); }); });
}

module.exports = {
    SocialController: SocialController
};
