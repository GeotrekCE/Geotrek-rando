'use strict';

function FlatPagesController(utilsFactory, flatService, $scope, $stateParams) {
    $scope.sanitizeData = utilsFactory.sanitizeData;

    function getPage() {
        flatService.getAFlatPage($stateParams.flatID)
            .then(
                function (pageData) {
                    $scope.flatPage = pageData;
                }
            );
    }

    getPage();
}

function FlatMenuController(flatService, $scope) {

    function initFlatMenu() {
        flatService.getFlatPages()
            .then(
                function (pagesData) {
                    $scope.flatpages = pagesData;
                    console.log(pagesData);
                }
            );
    }

    initFlatMenu();
}

module.exports = {
    FlatPagesController: FlatPagesController,
    FlatMenuController: FlatMenuController
};