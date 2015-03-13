'use strict';

function DetailController($scope, $rootScope, $state, $q, $stateParams, utilsFactory, resultsService, poisService, mapService) {

    var mainImage;
    $scope.sanitizeData = utilsFactory.sanitizeData;
    $scope.parseLength = utilsFactory.parseLength;
    $scope.removeDiacritics = utilsFactory.removeDiacritics;

    $scope.togglePois = function () {
        $scope.poisAreShown = !$scope.poisAreShown;
    };

    $scope.showLightbox = function (slideIndex) {
        $rootScope.$emit('openLightbox', slideIndex);
    };

    $scope.isSVG = utilsFactory.isSVG;

    function initCollapse(selector) {
        $scope.poisAreShown = true;
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
                    console.log('nearElements');
                    console.log($scope.nearElements);
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
                    }
                    $rootScope.$emit('resetPOIGallery');
                    console.log(elementPois);
                }
            );
    }

    function getResultDetails(forceRefresh) {
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
                    getPoisOfResult(result, forceRefresh);
                    getNearElements(result);
                    initCollapse();
                    $rootScope.$emit('initGallery', result.properties.pictures);
                    console.log(result);
                    // if (forceRefresh) {
                    //     $state.go(
                    //         'layout.detail',
                    //         {slug: result.properties.slug},
                    //         {
                    //             location: "replace",
                    //             inherit: false
                    //         }
                    //     );
                    // }
                },
                function (error) {
                    $state.go("layout.root");
                }
            );
    }

    getResultDetails();
    $rootScope.$on('switchGlobalLang', function () {
        if ($state.current.name === 'layout.detail') {
            getResultDetails(true);
        }
    });
}

module.exports = {
    DetailController: DetailController
};