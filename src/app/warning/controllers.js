'use strict';

function WarningPanelController($scope, $rootScope) {

    $scope.initWarningPanel = function () {
        $scope.showWarningPanel = true;
    };

    $scope.close = function () {
        $scope.showWarningPanel = false;
    };

    $scope.$on('showWarningPanel', function (event, args) {
        $scope.result = args.result;
        $scope.initWarningPanel();
    });

}

module.exports = {
    WarningPanelController: WarningPanelController
};