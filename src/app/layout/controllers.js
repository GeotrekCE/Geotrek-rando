'use strict';

function LayoutController($rootScope, $scope, $state, $location, resultsService, globalSettings, homeService, $translate, $timeout, Analytics, mapService) {
    $rootScope.currentState_name = $state.current.name;
    $rootScope.showFooterOnApp = globalSettings.SHOW_FOOTER;
    $rootScope.elementsLoading = 0;
    $rootScope.mapIsShown = true;
    $rootScope.placeHolderImage = globalSettings.PLACEHOLDER_IMAGE ? './images/custom/' + globalSettings.PLACEHOLDER_IMAGE : './images/placeholder.png';
    $rootScope.favoriteIcon = (globalSettings.FAVORITES_ICON ? globalSettings.FAVORITES_ICON : 'heart');

    var bowser          = require('bowser');
    $rootScope.isChrome = !!bowser.chrome;
    $rootScope.isIE     = !!bowser.msie;
    $rootScope.isEdge   = !!bowser.msedge;
    $rootScope.isSafari = !!bowser.safari;
    $rootScope.isWebkit = !!bowser.webkit;

    if (globalSettings.FAVICON) {
        var base = '/images/custom/';
        $rootScope.favIcon = {
            png: base + globalSettings.FAVICON.png,
            ico: base + globalSettings.FAVICON.ico
        };
    } else {
        var base = './images/';
        $rootScope.favIcon = {
            png: base + 'favicon-geotrek.png',
            ico: base + 'favicon-geotrek.ico'
        };
    }

    function iniDefaultMeta() {
        if ($state.current.name === 'layout.root') {
            $translate(['DEFAULT_META_TITLE', 'DEFAULT_META_DESCRIPTION'])
                .then(
                    function (translation) {
                        $rootScope.metaTitle = translation.DEFAULT_META_TITLE;
                        $rootScope.metaDescription = translation.DEFAULT_META_DESCRIPTION;
                    },
                    function (err) {
                        if (console) {
                            console.error(err);
                        }
                    }
                );
        }
    }

    $scope.foldResults = false;
    $scope.resultsPaneToggle = function resultsPaneToggle () {
        $scope.foldResults = !$scope.foldResults;
        setTimeout(function () {
            mapService.invalidateSize();
        }, 350);
    };

    iniDefaultMeta();

    if ($state.current.name === 'layout.root') {
        if (globalSettings.SHOW_HOME && angular.equals({}, $location.search())) {
            $rootScope.showHome = !homeService.getChoice();
        }
    } else {
        $rootScope.showHome = false;
    }

    var rootScopeEvents = [

        $rootScope.$on("$stateChangeSuccess",  function (event, toState, toParams, fromState, fromParams) {
            // to be used for back button //won't work when page is reloaded.
            $rootScope.previousState_name = fromState.name;
            $rootScope.currentState_name = toState.name;

            if (toState.name === 'layout.root') {
                iniDefaultMeta();
            }
        })
    ];
    //back button function called from back button's ng-click="back()"
    $rootScope.back = function back () {
        if (!$rootScope.previousState_name || $rootScope.previousState_name !== 'layout.root') {
            $state.go('layout.root');
        } else {
            window.history.back();
        }
    };

    rootScopeEvents.push(
        $rootScope.$on('startSwitchGlobalLang', function () {
            resultsService.getAllResults(true)
                .then(
                    function () {
                        $rootScope.$emit('switchGlobalLang');
                    }
                );
        })
    );

    $scope.$on('$destroy', function () { rootScopeEvents.forEach(function (dereg) { dereg(); }); });

}

function SidebarHomeController() {
}

function SidebarDetailController($scope, $rootScope, $modal, $stateParams, $location, globalSettings, resultsService, favoritesService, webglService) {

    $scope.webGLisEnable = webglService.isEnabled();

    function getResultDetails(forceRefresh) {
        if ($stateParams.slug) {
            resultsService.getAResultBySlug($stateParams.slug, $stateParams.catSlug, forceRefresh)
                .then(
                    function (data) {
                        $scope.result = data;
                    }
                );
        }
    }

    $scope.toggleFavorites = function toggleFavorites (currentElement) {
        var currentAction = '';
        if (favoritesService.isInFavorites(currentElement)) {
            currentAction = 'remove';
        } else {
            currentAction = 'add';
        }
        $rootScope.$broadcast('changeFavorite', {element: currentElement, action: currentAction});
    };

    $scope.show3d = function show3d () {
        var modal = $modal.open({
            templateUrl: '/app/3d/templates/rando-3d.html',
            controller: 'Rando3DController',
            resolve: {
                result: function () {
                    return $scope.result;
                }
            }
        });
    };

    $scope.showWarningPanel = function showWarningPanel () {
        $rootScope.$broadcast('showWarningPanel', {result: $scope.result});
    };

    $scope.favIcon = (globalSettings.FAVORITES_ICON ? globalSettings.FAVORITES_ICON : 'heart');
    $scope.isInFavorites = favoritesService.isInFavorites;

    $scope.back = $rootScope.back;

    getResultDetails(false);

}

function SidebarFlatController() {

}

function FooterController() {
}


module.exports = {
    LayoutController: LayoutController,
    SidebarHomeController: SidebarHomeController,
    SidebarDetailController: SidebarDetailController,
    SidebarFlatController: SidebarFlatController,
    FooterController: FooterController
};
