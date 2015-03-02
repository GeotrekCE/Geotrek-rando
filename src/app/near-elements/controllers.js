'use strict';

function NearListeController($scope) {
    $scope.hoverMarkerNear = function (currentPoi, state) {
        var layerEquivalent = document.querySelector('.layer-category-' + currentPoi.properties.category.id + '-' + currentPoi.id);
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
}

module.exports = {
    NearListeController: NearListeController
};