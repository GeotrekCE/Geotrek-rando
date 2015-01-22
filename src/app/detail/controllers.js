'use strict';

function DetailController($scope, $stateParams, utilsFactory, resultsService) {

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
                function (data) {
                    $scope.result = data;
                    console.log(data);
                }
            );
    }

    getResultDetails();

}

module.exports = {
    DetailController: DetailController
};