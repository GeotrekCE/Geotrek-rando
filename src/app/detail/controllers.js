'use strict';

function DetailController($scope, $stateParams, utilsFactory, resultsService, poisService) {

    $scope.sanitizeData = utilsFactory.sanitizeData;
    $scope.parseLength = utilsFactory.parseLength;
    $scope.removeDiacritics = utilsFactory.removeDiacritics;

    function initTabs(selector) {
        jQuery(selector + ' a').click(function (e) {
            e.preventDefault();
            jQuery(this).tab('show');
        });
    }

    function getResultDetails() {
        resultsService.getAResult($stateParams.slug)
            .then(
                function (result) {
                    $scope.result = result;
                    getPoisOfResult(result);
                    console.log(result);
                }
            );
    }

    function getPoisOfResult(result) {
        poisService.getPois()
            .then(
                function (pois) {
                    $scope.pois = pois;
                    console.log(pois);
                }
            );
    }

    getResultDetails();
    initTabs('more-infos .nav-tabs a');

}

module.exports = {
    DetailController: DetailController
};