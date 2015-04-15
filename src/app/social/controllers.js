'use strict';

function SocialController($scope, $rootScope, $location, $state, $stateParams, $translate, resultsService, flatService, globalSettings) {

    function initShareButtons(currentTitle) {
        $scope.fbShareLink = 'https://www.facebook.com/sharer/sharer.php';

        $scope.twitterShareLink = 'https://twitter.com/share?' +
            'text=' + encodeURIComponent(currentTitle);

        if (globalSettings.TWITTER_ID) {
            $scope.twitterShareLink += '&related=' + globalSettings.TWITTER_ID;
        }

        $scope.mailShareLink = 'mailto:?Subject=' + encodeURIComponent(currentTitle) + '&Body=' + $location.absUrl();
    }

    function initHomeMetaTags(translation) {
        $rootScope.twitterTags = [
            {
                name: "twitter:card",
                content: "summary_large_image"
            },
            {
                name: "twitter:title",
                content: translation
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
                content: globalSettings.DOMAIN + "/images/custom/" + globalSettings.DEFAULT_SHARE_IMG
            }

        ];

        $rootScope.facebookTags = [
            {
                property: "og:type",
                content: "article"
            },
            {
                property: "og:title",
                content: translation
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
                img = globalSettings.DOMAIN + "/images/custom/" + globalSettings.DEFAULT_SHARE_IMG;
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
        $translate('BANNER_TEXT')
            .then(
                function (data) {
                    initShareButtons(data);
                    initHomeMetaTags(data);
                },
                function (err) {
                    console.log(err);
                }
            );
    }

    function initShare() {
        var currentTitle = '';

        if ($state.current.name === 'layout.detail') {
            resultsService.getAResultBySlug($stateParams.slug)
                .then(
                    function (data) {
                        currentTitle = data.properties.name;
                        initDetailMetaTags(data);
                        initShareButtons(currentTitle);
                    },
                    function (err) {
                        console.log(err);
                    }
                );
        } else if ($state.current.name === 'layout.flat') {
            flatService.getAFlatPage($stateParams.flatID)
                .then(
                    function (data) {
                        currentTitle = data.title;
                        initShareButtons(currentTitle);
                        initHomeMetaTags(currentTitle);
                    },
                    function (err) {
                        console.log(err);
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