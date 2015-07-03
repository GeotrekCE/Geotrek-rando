'use strict';

function WarningPanelController($scope, $rootScope, WarningService, utilsFactory) {

    $scope.initWarningPanel = function () {
        $scope.showWarningPanel = true;
    };

    $scope.close = function () {
        $scope.showWarningPanel = false;
    };

    $scope.sendWarning = function () {
        if ($scope.warningForm.$valid) {
            WarningService.sendWarning($scope.warning);
        }
    };

    $scope.$on('showWarningPanel', function (event, args) {
        $scope.result = args.result;
        WarningService.getWarningCategories()
            .then(
                function (categories) {
                    $scope.warning = {};
                    $scope.warning.location = utilsFactory.getStartPoint($scope.result);
                    $scope.warning.category = categories[0].id;
                    $scope.warningCategories = categories;
                },
                function (err) {
                    console.error(err);
                }
            );
        $scope.initWarningPanel();
    });

}

module.exports = {
    WarningPanelController: WarningPanelController
};
