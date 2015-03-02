'use strict';

function DetailController($scope, $rootScope, $q, $stateParams, utilsFactory, resultsService, poisService, mapService) {

    var mainImage;
    $scope.sanitizeData = utilsFactory.sanitizeData;
    $scope.parseLength = utilsFactory.parseLength;
    $scope.removeDiacritics = utilsFactory.removeDiacritics;

    function initTabs(selector) {
        jQuery(selector + ' a').click(function (e) {
            e.preventDefault();
            jQuery(this).tab('show');
        });
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

    function getPoisOfResult(result) {
        poisService.getPoisFromElement(result.id)
            .then(
                function (pois) {
                    $scope.pois = pois.features;
                    console.log(pois);
                }
            );
    }

    function getResultDetails() {
        resultsService.getAResultBySlug($stateParams.slug)
            .then(
                function (result) {
                    getPoisOfResult(result);
                    getNearElements(result);
                    $scope.result = result;
                    $rootScope.$emit('initGallery', result.properties.pictures);
                    console.log(result);
                }
            );
    }

    $scope.showLightbox = function (slideIndex) {
        $rootScope.$emit('openLightbox', slideIndex);
    };

    $scope.isSVG = utilsFactory.isSVG;

    getResultDetails();
    initTabs('more-infos .nav-tabs a');
    console.log($rootScope.currentState_name);
}

module.exports = {
    DetailController: DetailController
};