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

    $scope.currentInterest = 'none';

    $scope.toggleInterest = function (interest) {
        if ($scope.currentInterest === interest) {
            $scope.currentInterest = '';
        } else {
            $scope.currentInterest = interest;
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
            elementChildren = [],
            tempNear = [];

        _.each(result.properties.children, function(child) {
            elementChildren.push({
                category_id: result.properties.category.id,
                id: child
            });
        });

        var nearElements = _.union(result.properties.treks, result.properties.touristic_contents, result.properties.touristic_events);

        _.each(nearElements, function (element) {
            if (!utilsFactory.elementIsInArray(elementChildren, element)) {
                tempNear.push(element);
            }
        });
        nearElements = tempNear;
        $scope.nearElements = [];
        _.forEach(nearElements, function (element) {
            promises.push(
                resultsService.getAResultByID(element.id, element.category_id)
                    .then(
                        function (elementData) {
                            if (elementData.properties.begin_date) {
                                var currentDate = new Date().toISOString().substr(0, 10);
                                var eventDate = elementData.properties.end_date || elementData.properties.begin_date;
                                if (eventDate > currentDate) {
                                    $scope.nearElements.push(elementData);
                                }
                            } else {
                                $scope.nearElements.push(elementData);
                            }
                        },
                        function (err) {
                            if (console) {
                                console.error(err);
                            }
                        }
                    )
            );
        });

        $q.all(promises)
            .then(
                function () {
                    mapService.createElementsMarkers($scope.nearElements, 'near');
                    deferred.resolve($scope.nearElements);
                }
            );

        return deferred.promise;
    }

    function getChildren(result) {
        var deferred = $q.defer(),
            promises = [],
            elementChildren = [];

        _.each(result.properties.children, function(child) {
            elementChildren.push({
                category_id: result.properties.category.id,
                id: child
            });
        });

        $scope.elementChildren = [];

        _.forEach(elementChildren, function (element) {
            promises.push(
                resultsService.getAResultByID(element.id, element.category_id)
                    .then(
                        function (elementData) {
                            $scope.elementChildren.push(elementData);
                        },
                        function (err) {
                            if (console) {
                                console.error(err);
                            }
                        }
                    )
            );
        });

        $q.all(promises)
            .then(
                function () {
                    mapService.createElementsMarkers($scope.elementChildren, 'children');
                    deferred.resolve($scope.elementChildren);
                }
            );

        return deferred.promise;
    }

    function getParent(result) {
        var deferred = $q.defer(),
            promises = [],
            parentsElement = [];

        _.each(result.properties.parents, function(parent) {
            parentsElement.push({
                category_id: result.properties.category.id,
                id: parent
            });
        });

        console.log(parentsElement);

        $scope.parentsElement = [];

        _.forEach(parentsElement, function (element) {
            promises.push(
                resultsService.getAResultByID(element.id, element.category_id)
                    .then(
                        function (elementData) {
                            $scope.parentsElement.push(elementData);
                        },
                        function (err) {
                            if (console) {
                                console.error(err);
                            }
                        }
                    )
            );
        });

        $q.all(promises)
            .then(
                function () {
                    // mapService.createElementsMarkers($scope.parentsElement, 'parent');
                    deferred.resolve($scope.parentsElement);
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
                                if (globalSettings.DEFAULT_INTEREST === '') {
                                    activeDefaultType = '';
                                } else {
                                    if (globalSettings.DEFAULT_INTEREST === 'pois' || !activeDefaultType) {
                                        activeDefaultType = 'pois';
                                    }
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
                            if (globalSettings.DEFAULT_INTEREST === '') {
                                activeDefaultType = '';
                            } else {
                                if (globalSettings.DEFAULT_INTEREST === 'near' || !activeDefaultType) {
                                    activeDefaultType = 'near';
                                }
                            }
                        }
                    }
                )
        );

        if (result.properties.children && result.properties.children.length > 0) {
            promises.push(
                getChildren(result)
                    .then(
                        function (children) {
                            if (children.length > 0) {
                                if (globalSettings.DEFAULT_INTEREST === '') {
                                    activeDefaultType = '';
                                } else {
                                    if (globalSettings.DEFAULT_INTEREST === 'children' || !activeDefaultType) {
                                        activeDefaultType = 'children';
                                    }
                                }
                            }
                        }
                    )
            );
        }

        if (result.properties.parents) {
            promises.push(
                getParent(result)
                    .then(
                        function (parents) {
                            if (parents.length > 0) {
                                if (globalSettings.DEFAULT_INTEREST === '') {
                                    activeDefaultType = '';
                                } else {
                                    if (globalSettings.DEFAULT_INTEREST === 'parents' || !activeDefaultType) {
                                        activeDefaultType = 'parents';
                                    }
                                }
                            }
                        }
                    )
            );
        }

        $q.all(promises)
            .then(
                function () {
                    if (activeDefaultType === null) {
                        $timeout(function () {
                            mapService.invalidateSize();
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
            promise = resultsService.getAResultBySlug($stateParams.slug, $stateParams.catSlug);
        } else {
            promise = resultsService.getAResultByID($scope.result.id, $scope.result.properties.category.id);
        }

        promise
            .then(
                function (result) {
                    $rootScope.metaTitle = result.properties.name;
                    $rootScope.metaDescription = result.properties.description_teaser;
                    $scope.result = result;
                    $rootScope.$emit('detailUpdated');
                    $rootScope.elementsLoading --;
                    getInterests(result, forceRefresh);
                    $rootScope.$emit('initGallery', result.properties.pictures);
                },
                function (error) {
                    $rootScope.elementsLoading --;
                    $state.go("layout.root");
                }
            );
    }

    getResultDetails();
    // switchInterestsNodes();

    // angular.element(window).on('resize', switchInterestsNodes);

    var rootScopeEvents = [
        $rootScope.$on('switchGlobalLang', function () {
            if ($state.current.name === 'layout.detail') {
                getResultDetails(true);
            }
        })
    ];

    $scope.$on('$destroy', function () { rootScopeEvents.forEach(function (dereg) { dereg(); }); });

}

module.exports = {
    DetailController: DetailController
};
