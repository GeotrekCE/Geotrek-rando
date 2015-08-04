'use strict';

function SocialController($scope, $rootScope, $location, $state, $stateParams, $translate, resultsService, flatService, globalSettings, utilsFactory) {

    $scope.shareIcon = (globalSettings.SHARE_ICON ? globalSettings.SHARE_ICON : 'share-alt');

    function initShareButtons(translatedContent, element) {

        $scope.fbShareLink = 'https://www.facebook.com/dialog/feed?' +
            'app_id=' + globalSettings.FACEBOOK_APP_ID +
            '&link=' + encodeURIComponent($location.absUrl()) +
            '&redirect_uri=' + encodeURIComponent($location.absUrl());

        $scope.twitterShareLink = 'https://twitter.com/share?';

        if (element) {
            $scope.fbShareLink += '' +
                '&name=' + encodeURIComponent(element.properties.name) +
                '&caption=' + encodeURIComponent(utilsFactory.decodeEntities(element.properties.description_teaser)) +
                '&description=' + encodeURIComponent(utilsFactory.decodeEntities(element.properties.ambiance));

            if (element.properties.pictures[0]) {
                $scope.fbShareLink += '&picture=' + encodeURIComponent(element.properties.pictures[0].url);
            } else {
                $scope.fbShareLink += '&picture=' + encodeURIComponent(globalSettings.API_URL + "/images/custom/" + globalSettings.DEFAULT_SHARE_IMG);
            }

            $scope.twitterShareLink += 'text=' + encodeURIComponent(element.properties.name);

            $scope.mailShareLink = 'mailto:?Subject=' + encodeURIComponent(element.properties.name) + '&Body=' + encodeURIComponent(utilsFactory.decodeEntities(element.properties.description_teaser)) + '%0D%0A' + encodeURIComponent($location.absUrl());

        } else {
            $scope.fbShareLink += '' +
                '&name=' + encodeURIComponent(translatedContent.BANNER_TEXT) +
                '&caption=' + encodeURIComponent($location.absUrl()) +
                '&description=' + encodeURIComponent(translatedContent.SHARING_DEFAULT_TEXT) +
                '&picture=' + encodeURIComponent(globalSettings.API_URL + "/images/custom/" + globalSettings.DEFAULT_SHARE_IMG);

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
                content: globalSettings.API_URL + "/images/custom/" + globalSettings.DEFAULT_SHARE_IMG
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
                content: globalSettings.API_URL + "/images/custom/home/head.jpg"
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
                img = globalSettings.API_URL + "/images/custom/" + globalSettings.DEFAULT_SHARE_IMG;
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
        } else {
            $rootScope.$on('translationReady', function () {
                initShareOnTranslate();
            });
        }

    }

    initShare();

    $rootScope.$on('$stateChangeSuccess', initShare);
}

module.exports = {
    SocialController: SocialController
};
