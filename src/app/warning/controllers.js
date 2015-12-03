'use strict';

function WarningPanelController($scope, $rootScope, WarningService, WarningMapService, utilsFactory) {

    var onMap = false;

    $scope.initWarningPanel = function () {
        $rootScope.showWarningPanel = true;
        if ($rootScope.mapIsShown) {
            onMap = true;
            $rootScope.mapIsShown = false;
        } else {
            onMap = false;
        }
    };

    function updateLocation(newLocation) {
        $scope.warning.location = newLocation;
    }

    $scope.close = function () {
        if (onMap) {
            $rootScope.mapIsShown = true;
        }
        $rootScope.showWarningPanel = false;
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

    $rootScope.$on('showWarningPanel', function (event, args) {
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
