'use strict';

function FlatPagesController() {

}

function FlatMenuController(flatService, $scope) {

    function initFlatMenu() {
        flatService.getFlatPages()
            .then(
                function (data) {
                    $scope.flatpages = data;
                    console.log(data);
                }
            );
    }

    initFlatMenu();
}

module.exports = {
    FlatPagesController: FlatPagesController,
    FlatMenuController: FlatMenuController
};