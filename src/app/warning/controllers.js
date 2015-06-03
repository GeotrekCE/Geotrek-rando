'use strict';

function WarningPanelController($scope, $rootScope) {

    $scope.initWarningPanel = function () {
        console.log('init panel !');
        $scope.showWarningPanel = true;
        console.log($scope.result);
    };

    $scope.close = function () {
        $scope.showWarningPanel = false;
        console.log('close it !');
    };

    $scope.$on('showWarningPanel', function (event, args) {
        $scope.result = args.result;
        $scope.initWarningPanel();
    });

}

module.exports = {
    WarningPanelController: WarningPanelController
};