'use strict';

function WarningPanelController($scope, $rootScope, WarningService, WarningMapService, utilsFactory) {

    $scope.initWarningPanel = function () {
        $scope.showWarningPanel = true;
    };

    function updateLocation(newLocation) {
        $scope.warning.location = newLocation;
    }

    $scope.close = function () {
        $scope.showWarningPanel = false;
        WarningMapService.removeMap();
        $scope.warning = null;
    };

    $scope.sendWarning = function () {
        if ($scope.warningForm.$valid) {
            WarningService.sendWarning($scope.warning)
                .then(function (answer) {
                    $scope.warningStatus = 'success';
                })
                .catch(function (err) {
                    $scope.warningStatus = 'error';
                });
        }
    };

    $scope.$on('showWarningPanel', function (event, args) {
        $scope.result = args.result;
        WarningService.getWarningCategories()
            .then(function (categories) {
                $scope.warningStatus = null;
                $scope.warning = {};
                $scope.warning.location = utilsFactory.getStartPoint($scope.result);
                $scope.warningCategories = categories;
                $scope.warning.category = categories[0].id.toString();
                WarningMapService.getMap('warning-map', $scope.result);
                WarningMapService.addCallback(updateLocation);
            })
            .catch(function (err) {
                console.error(err);
            });
        $scope.initWarningPanel();
    });

}

module.exports = {
    WarningPanelController: WarningPanelController
};
