'use strict';

function DetailController($scope, $rootScope, $state, $q, $modal, $timeout, $stateParams, globalSettings, utilsFactory, resultsService, sensitiveService, poisService, mapService, translationService, detailService) {

    $scope.parseLength = utilsFactory.parseLength;
    $scope.removeDiacritics = utilsFactory.removeDiacritics;
    $scope.nearElementsByCategories = globalSettings.NEAR_ELEMENTS_CATEGORIES;
    $scope.displayAsidesCounter = globalSettings.DISPLAY_ASIDES_COUNTERS;
    if (globalSettings.RULES_FLAT_PAGES_ID) {
        $scope.rulesId = globalSettings.RULES_FLAT_PAGES_ID;
    } else {
        $scope.rulesId = null;
    }

    $scope.getUrlImg = function getUrlImg (path) {
        return globalSettings.API_URL + path;
    };

    $scope.formatTime = function formatTime (date) {
        return utilsFactory.formatTime(date, translationService.getCurrentLang());
    };

    $scope.currentInterest = 'none';

    $scope.toggleInterest = function toggleInterest (interest) {
        if (mapService.map && mapService.map.closePopup) {
            mapService.map.closePopup();
        }

        if ($scope.currentInterest === interest) {
            $scope.currentInterest = '';
        } else {
            $scope.currentInterest = interest;
        }
    };

    $scope.toggleCategory = function toggleCategory (category) {
        if (category.isActive !== undefined) {
            category.isActive = category.isActive === false ? true : false;
        } else {
            category.isActive = true;
        }
    };

    $scope.foldAside = false;
    $scope.asidePaneToggle = function asidePaneToggle () {
        $scope.foldAside = !$scope.foldAside;
        setTimeout(function () {
            mapService.invalidateSize();
        }, 350);
    };

    $scope.showLightbox = function showLightbox (images, slideIndex) {
        $modal.open({
            template: require('../gallery/templates/lightbox-gallery.html'),
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

    // function switchInterestsNodes() {
    //     if (document.querySelector('.main-infos .interests') && window.matchMedia("(min-width: 769px)").matches) {
    //         document.querySelector('.detail-map').appendChild(document.querySelector('.main-infos .interests'));
    //     }
    //     if (document.querySelector('.detail-map .interests') && window.matchMedia("(max-width: 768px)").matches) {
    //         document.querySelector('.main-infos').appendChild(document.querySelector('.detail-map .interests'));
    //     }
    // }

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
                                if (eventDate >= currentDate) {
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
                    var nearElementsCategories = [];
                    _.forEach($scope.nearElements, function (element) {
                        nearElementsCategories.push(element.properties.category);
                    });

                    $scope.nearElementsCategories = _.uniqBy(nearElementsCategories, function(item) {
                        return item.id;
                    });

                    mapService.createElementsMarkers($scope.nearElements, 'near');
                    deferred.resolve($scope.nearElements);
                }
            );

        return deferred.promise;
    }

    /**
     * Gets all children steps of given parent trek.
     *
     * @param {Obj} parentTrek
     *   The parent trek.
     * @return {Promise}
     *   Result promise, with the list of children passed as parameter.
     */
    function _getChildren(parentTrek) {
        var deferred = $q.defer(),
            promises = [],
            children = [];

        _.each(parentTrek.properties.children, function(childId, stepNumber) {
            var childIds = {
                category_id: parentTrek.properties.category.id,
                id: childId,
                stepNumber: stepNumber
            };

            promises.push(
                resultsService.getATrekByID(childIds.id)
                    .then(
                        function (childData) {
                            childData.properties.stepNumber = childIds.stepNumber + 1;
                            children.push(childData);
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
            .then(function () {
                deferred.resolve(children);
            });

        return deferred.promise;
    }

    /**
     * Populates the sidebar with all the children steps of given trek.
     *
     * @param {Obj} parentTrek
     *   The parent trek.
     */
    function populateUIWithChildren(parentTrek) {
        var deferred = $q.defer();

        _getChildren(parentTrek).then(function(children) {
            $scope.elementChildren = children;

            deferred.resolve(children);
        });

        return deferred.promise;
    }

    function getParent(result, currentParentId) {
        var deferred = $q.defer(),
            promises = [],
            parentsElement = [];

        _.each(result.properties.parents, function(parent) {
            parentsElement.push({
                category_id: result.properties.category.id,
                id: parent
            });
        });

        $scope.parentsElement = [];

        _.forEach(parentsElement, function (element) {
            promises.push(
                resultsService.getAResultByID(element.id, element.category_id)
                    .then(
                        function (elementData) {
                            if (elementData.id === currentParentId) {
                                result.properties.stepNumber = detailService.getStepNumberInParent(result.id, elementData);
                            }
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
            detailService.setCurrentParent(result.id);
            promises.push(
                populateUIWithChildren(result)
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

        if (result.properties.parents && result.properties.parents.length > 0) {
            var currentParentId = detailService.getCurrentParent();
            promises.push(
                getParent(result, currentParentId)
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

                    // If there are no POI listing currently open, expand
                    // the default one.
                    if (!$scope.currentInterest || $scope.currentInterest === 'none') {
                        $scope.toggleInterest(activeDefaultType);
                    }
                }
            );
    }

    function getResultDetails(forceRefresh) {
        $rootScope.elementsLoading = 1;
        var promise;
        if (!forceRefresh) {
            promise = resultsService.getAResultBySlug($stateParams.slug, $stateParams.catSlug);
        } else {
            promise = resultsService.getAResultByID($scope.result.id, $scope.result.properties.category.id);
        }

        promise
            .then(
                function (result) {
                    if (globalSettings.SENSITIVE_TILELAYER) {
                        sensitiveService.getSensitive(result.id)
                            .then(function(sensitives) {
                                $scope.sensitives = sensitives
                            })
                    }

                    $state.transitionTo('layout.detail',
                        { catSlug: result.properties.category.slug, slug: result.properties.slug },
                        { location: true, inherit: true, relative: $state.$current, notify: false }
                    );

                    if (result.properties.parents) {
                        var currentParentId = detailService.getCurrentParent();

                        // Fetch parent trek.
                        resultsService.getAResultByID(currentParentId, result.properties.category.id).then(
                            function(parentResult) {
                                _getChildren(parentResult).then(function(children) {
                                    // Handle "previous" and "next" links.
                                    $scope.trekSteps = children;
                                });
                            }
                        );

                        // Handle "Previous" link state.
                        if (result.properties.previous !== undefined) {
                            // Get previous step
                            var previousID = result.properties.previous[currentParentId];
                            if (previousID !== null && previousID !== undefined) {
                                $scope.previousStep = true;
                                resultsService.getAResultByID(previousID, result.properties.category.id).then(function(res) {
                                    $scope.previousStep = res.properties;
                                }), function(err) {
                                    console.log(err);
                                };
                            }
                        }

                        // Handle "Next" link state.
                        if (result.properties.next !== undefined) {
                            // Get next step
                            var nextID = result.properties.next[currentParentId];
                            if (nextID !== null && nextID !== undefined) {
                                $scope.nextStep = true;
                                resultsService.getAResultByID(nextID, result.properties.category.id).then(function(res) {
                                    $scope.nextStep = res.properties;
                                }), function(err) {
                                    console.log(err);
                                };
                            }
                        }
                    }


                    $rootScope.metaTitle = result.properties.name;
                    $rootScope.metaDescription = result.properties.description_teaser;
                    $scope.result = result;
                    $rootScope.elementsLoading --;
                    getInterests(result, forceRefresh);
                    $rootScope.$emit('initGallery', result.properties.pictures);
                    $scope.result.informations = detailService.hasInfos(result.properties, 'duration_pretty', 'duration', 'difficulty.label', 'route', 'ascent', 'networks', 'target_audience');
                    $rootScope.$emit('detailUpdated', forceRefresh);
                },
                function () {
                    $rootScope.elementsLoading --;
                    $state.go("layout.root");
                }
            );
    }

    getResultDetails(false);
    // switchInterestsNodes();

    // angular.element(window).on('resize', switchInterestsNodes);

    var rootScopeEvents = [
        $rootScope.$on('switchGlobalLang', function () {
            if ($state.current.name === 'layout.detail') {
                getResultDetails(true);
            }
        }),
        $rootScope.$on('$stateChangeSuccess', function (event, toState) {
            if (toState.name !== 'layout.detail') {
                detailService.setCurrentParent(null);
            }
        })
    ];

    $scope.approved = globalSettings.APPROVED_BIG;
    $scope.approvedLabel = globalSettings.APPROVED_LABEL;

    $scope.$on('$destroy', function () { rootScopeEvents.forEach(function (dereg) { dereg(); }); });

}

module.exports = {
    DetailController: DetailController
};
