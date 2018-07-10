'use strict';

function FlatPagesController(utilsFactory, flatService, $scope, $state, $rootScope, $stateParams) {

    function getPage(pageID) {
        $rootScope.elementsLoading = 1;
        var page = pageID || $stateParams.flatID;
        flatService.getAFlatPage(page)
            .then(
                function (pageData) {
                    $rootScope.metaTitle = pageData.title;
                    $rootScope.metaDescription = pageData.title;
                    $scope.flatPage = pageData;
                    $rootScope.elementsLoading --;
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

    var rootScopeEvents = [
        $rootScope.$on('flatUpdated', function () {
            getPage($scope.flatPage.id);
        })
    ];

    $scope.$on('$destroy', function () { rootScopeEvents.forEach(function (dereg) { dereg(); }); });
}

function FlatMenuController(flatService, $scope, $rootScope) {

    function initFlatMenu(forceReload) {
        flatService.getFlatPages(forceReload)
            .then(
                function (pagesData) {
                    $scope.flatpages = pagesData;
                    if (forceReload) {
                        $rootScope.$emit('flatUpdated');
                    }
                }
            );
    }

    initFlatMenu();

    $scope.showFlatMenu = false;
    $scope.toggleFlatMenu = function toggleFlatMenu() {
        $scope.showFlatMenu = !$scope.showFlatMenu;
    };
    $scope.foldFlatMenu = function foldFlatMenu() {
        $scope.showFlatMenu = false;
    }

    var rootScopeEvents = [
        $rootScope.$on('startSwitchGlobalLang', function () {
            initFlatMenu(true);
        })
    ];

    $scope.$on('$destroy', function () { rootScopeEvents.forEach(function (dereg) { dereg(); }); });

}

module.exports = {
    FlatPagesController: FlatPagesController,
    FlatMenuController: FlatMenuController
};
