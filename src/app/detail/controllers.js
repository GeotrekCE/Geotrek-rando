'use strict';

function DetailController($scope, $rootScope, $state, $q, $modal, $timeout, $stateParams, globalSettings, utilsFactory, resultsService, poisService, mapService) {

    var mainImage;
    $scope.sanitizeData = utilsFactory.sanitizeData;
    $scope.parseLength = utilsFactory.parseLength;
    $scope.removeDiacritics = utilsFactory.removeDiacritics;
    if (globalSettings.RULES_FLAT_PAGES_ID) {
        $scope.rulesId = globalSettings.RULES_FLAT_PAGES_ID;
    } else {
        $scope.rulesId = null;
    }

    $scope.togglePois = function () {
        $scope.poisAreShown = !$scope.poisAreShown;
    };

    $scope.showLightbox = function (images, slideIndex) {
        var modal = $modal.open({
            templateUrl: '/app/gallery/templates/lightbox-gallery.html',
            controller: 'GalleryController',
            windowClass: 'lightbox',
            resolve: {
                images: function () {
                    return images;
                },
                slideIndex: function () {
                    return slideIndex;
                }
            }
        });
    };

    $scope.isSVG = utilsFactory.isSVG;

    function initCollapse(selector) {
        $scope.poisAreShown = true;
    }

    function switchInterestsNodes() {
        if (document.querySelector('.main-infos .interests') && window.matchMedia("(min-width: 769px)").matches) {
            document.querySelector('.detail-map').appendChild(document.querySelector('.main-infos .interests'));
        }
        if (document.querySelector('.detail-map .interests') && window.matchMedia("(max-width: 768px)").matches) {
            document.querySelector('.main-infos').appendChild(document.querySelector('.detail-map .interests'));
        }
    }

    function getNearElements(result) {
        var promises = [],
            nearElements = result.properties.treks.concat(result.properties.touristic_contents, result.properties.touristic_events);

        $scope.nearElements = [];
        _.forEach(nearElements, function (element) {
            promises.push(
                resultsService.getAResultByID(element.id, element.category_id)
                    .then(
                        function (elementData) {
                            $scope.nearElements.push(elementData);
                        }
                    )
            );
        });

        $q.all(promises)
            .then(
                function () {
                    mapService.createNearElementsMarkers($scope.nearElements);
                }
            );
    }

    function getPoisOfResult(result, forceRefresh) {
        poisService.getPoisFromElement(result.id, forceRefresh)
            .then(
                function (elementPois) {
                    $scope.pois = elementPois.features;
                    if ($scope.pois.length === 0) {
                        $scope.poisAreShown = false;
                        // Wait till css animation is over
                        $timeout(function () {
                            $rootScope.$emit('refreshMapSize');
                        }, 500);
                    }
                    $rootScope.$emit('resetPOIGallery');
                }
            );
    }

    function getResultDetails(forceRefresh) {
        $scope.isLoading = true;
        var promise;
        if (!forceRefresh) {
            promise = resultsService.getAResultBySlug($stateParams.slug);
        } else {
            promise = resultsService.getAResultByID($scope.result.id, $scope.result.properties.category.id);
        }

        promise
            .then(
                function (result) {
                    $scope.result = result;
                    $scope.isLoading = false;
                    getPoisOfResult(result, forceRefresh);
                    getNearElements(result);
                    initCollapse();
                    $rootScope.$emit('initGallery', result.properties.pictures);
                },
                function (error) {
                    $state.go("layout.root");
                }
            );
    }

    getResultDetails();
    switchInterestsNodes();

    angular.element(window).on('resize', switchInterestsNodes);

    $rootScope.$on('switchGlobalLang', function () {
        if ($state.current.name === 'layout.detail') {
            getResultDetails(true);
        }
    });
}

module.exports = {
    DetailController: DetailController
};