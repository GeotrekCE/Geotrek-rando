'use strict';

function FlatPagesController(utilsFactory, flatService, $scope, $state, $rootScope, $stateParams) {
    $scope.sanitizeData = utilsFactory.sanitizeData;

    function getPage(pageID) {
        var page = pageID || $stateParams.flatID;
        flatService.getAFlatPage(page)
            .then(
                function (pageData) {
                    $scope.flatPage = pageData;
                    if (!isNaN(utilsFactory.isTrueInt(page))) {
                        $state.go('layout.flat', {flatID: $scope.flatPage.slug});
                    }
                },
                function () {
                    $state.go('layout.root');
                }
            );
    }

    getPage();
    $rootScope.$on('flatUpdated', function () {
        getPage($scope.flatPage.id);
    });
}

function FlatMenuController(flatService, $scope, $rootScope) {

    function initFlatMenu(forceReload) {
        flatService.getFlatPages(forceReload)
            .then(
                function (pagesData) {
                    $scope.flatpages = pagesData;
                    console.log(pagesData);
                    if (forceReload) {
                        $rootScope.$emit('flatUpdated');
                    }
                }
            );
    }

    initFlatMenu();
    $rootScope.$on('startSwitchGlobalLang', function () {
        initFlatMenu(true);
    });
}

module.exports = {
    FlatPagesController: FlatPagesController,
    FlatMenuController: FlatMenuController
};