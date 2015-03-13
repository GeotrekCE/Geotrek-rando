'use strict';

function PoisListeController($scope, $rootScope) {

    $scope.hoverMarkerPoi = function (currentPoi, state) {
        var layerEquivalent = document.querySelector('.layer-' + currentPoi.properties.type.id + '-' + currentPoi.id);
        if (layerEquivalent !== null) {
            if (state === 'enter') {
                if (!layerEquivalent.classList.contains('hovered')) {
                    layerEquivalent.classList.add('hovered');
                }
            } else {
                if (layerEquivalent.classList.contains('hovered')) {
                    layerEquivalent.classList.remove('hovered');
                }
            }
        }
    };

    function initListeClasses() {
        $scope.isOpened = {};
        _.each($scope.pois, function (poi) {
            $scope.isOpened[poi.id] = 'closed';
        });
    }

    $scope.togglePoi = function (poiId) {
        if ($scope.isOpened[poiId] === 'closed') {
            document.querySelector('.informations').classList.add('collapsed');
            document.querySelector('.interests').classList.add('expend');
            document.querySelector('.detail-map').classList.add('expend');
            _.forEach($scope.isOpened, function (isOpenedValue, index) {
                if (parseInt(index, 10) === parseInt(poiId, 10)) {
                    $scope.isOpened[index] = 'opened';
                } else {
                    $scope.isOpened[index] = 'hidden';
                }
            });
        } else {
            document.querySelector('.informations').classList.remove('collapsed');
            document.querySelector('.interests').classList.remove('expend');
            document.querySelector('.detail-map').classList.remove('expend');
            _.forEach($scope.isOpened, function (isOpenedValue, index) {
                $scope.isOpened[index] = 'closed';
            });
        }
    };

    initListeClasses();
    $rootScope.$on('resetPOIGallery', function () {
        initListeClasses();
    });
}

module.exports = {
    PoisListeController : PoisListeController
};