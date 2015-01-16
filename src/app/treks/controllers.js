'use strict';

function TreksListeController($scope, treksService) {

    function updateTreks() {
        treksService.getTreks()
        .then(
            function(data) {
                $scope.treks = data;
            }
        );
    }

    updateTreks();
        
}


module.exports = {
    TreksListeController: TreksListeController
};