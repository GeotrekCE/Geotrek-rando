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

    function getPoisOfResult(result) {
        poisService.getPois()
            .then(
                function (pois) {
                    $scope.pois = pois;
                    console.log(pois);
                }
            );
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

    $scope.isSVG = function (file) {
        var regexp = /\.(svg)$/i;
        if (file.toString().match(regexp)) {
            return true;
        }

        return false;
    };

    getResultDetails();
    initTabs('more-infos .nav-tabs a');

}

module.exports = {
    DetailController: DetailController
};