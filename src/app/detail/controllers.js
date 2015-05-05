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

    $scope.toggleInterest = function (currentInterest) {
        if ($scope.interestShown === currentInterest) {
            $scope.interestShown = '';
        } else {
            $scope.interestShown = currentInterest;
        }
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

    function switchInterestsNodes() {
        if (document.querySelector('.main-infos .interests') && window.matchMedia("(min-width: 769px)").matches) {
            document.querySelector('.detail-map').appendChild(document.querySelector('.main-infos .interests'));
        }
        if (document.querySelector('.detail-map .interests') && window.matchMedia("(max-width: 768px)").matches) {
            document.querySelector('.main-infos').appendChild(document.querySelector('.detail-map .interests'));
        }
    }

    function getNearElements(result) {
        var deferred = $q.defer(),
            promises = [],
            nearElements = result.properties.treks.concat(result.properties.touristic_contents, result.properties.touristic_events);

        $scope.nearElements = [];
        _.forEach(nearElements, function (element) {
            promises.push(
                resultsService.getAResultByID(element.id, element.category_id)
                    .then(
                        function (elementData) {
                            $scope.nearElements.push(elementData);
                        },
                        function (err) {
                            console.error(err);
                        }
                    )
            );
        });

        $q.all(promises)
            .then(
                function () {
                    mapService.createNearElementsMarkers($scope.nearElements);
                    deferred.resolve($scope.nearElements);
                }
            );

        return deferred.promise;
    }

    function getPoisOfResult(result, forceRefresh) {
        var deferred = $q.defer();

        poisService.getPoisFromElement(result.id, forceRefresh)
            .then(
                function (elementPois) {
                    $scope.pois = elementPois.features;
                    $rootScope.$emit('resetPOIGallery');
                    deferred.resolve($scope.pois);
                }
            );

        return deferred.promise;
    }

    function getInterests(result, forceRefresh) {
        var promises = [],
            activeDefaultType = null;

        if (result.properties.contentType === 'trek') {
            promises.push(
                getPoisOfResult(result, forceRefresh)
                    .then(
                        function (pois) {
                            if (pois.length > 0) {
                                if (globalSettings.DEFAULT_INTEREST === 'pois' || !activeDefaultType) {
                                    activeDefaultType = 'pois';
                                }
                            }
                        }
                    )
            );
        }

        promises.push(
            getNearElements(result)
                .then(
                    function (nearElements) {
                        if (nearElements.length > 0) {
                            if (globalSettings.DEFAULT_INTEREST === 'near' || !activeDefaultType) {
                                activeDefaultType = 'near';
                            }
                        }
                    }
                )
        );

        $q.all(promises)
            .then(
                function () {
                    if (!activeDefaultType) {
                        $timeout(function () {
                            $rootScope.$emit('refreshMapSize');
                        }, 500);
                    }
                    $scope.toggleInterest(activeDefaultType);
                }
            );

        
    }

    function getResultDetails(forceRefresh) {
        $rootScope.elementsLoading ++;
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
                    $rootScope.elementsLoading --;
                    getInterests(result, forceRefresh);
                    $rootScope.$emit('initGallery', result.properties.pictures);
                },
                function (error) {
                    $state.go("layout.root");
                    $rootScope.elementsLoading --;
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