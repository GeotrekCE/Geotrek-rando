'use strict';

function DetailController($scope, $rootScope, $stateParams, utilsFactory, resultsService, poisService) {

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
        resultsService.getAResult($stateParams.slug)
            .then(
                function (result) {
                    getPoisOfResult(result);
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