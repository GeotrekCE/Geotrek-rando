'use strict';

function PoisListeController($scope) {
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
}

module.exports = {
    PoisListeController : PoisListeController
};