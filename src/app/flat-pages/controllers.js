'use strict';

function FlatPagesController(utilsFactory, flatService, $scope, $state, $rootScope, $stateParams) {
    $scope.sanitizeData = utilsFactory.sanitizeData;

    function getPage(pageID) {
        var page = pageID || $stateParams.flatID;
        flatService.getAFlatPage(page)
            .then(
                function (pageData) {
                    $rootScope.metaTitle = pageData.title;
                    $rootScope.metaDescription = pageData.title;
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