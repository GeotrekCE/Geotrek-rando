'use strict';

function LayoutController($rootScope, $scope, $state, $location, resultsService, globalSettings, homeService, $translate, $timeout) {
    $rootScope.currentState_name = $state.current.name;
    $rootScope.showFooterOnApp = globalSettings.SHOW_FOOTER;
    $rootScope.elementsLoading = 0;
    $rootScope.mapIsShown = false;
    $rootScope.placeHolderImage = globalSettings.PLACEHOLDER_IMAGE ? './images/custom/' + globalSettings.PLACEHOLDER_IMAGE : './images/placeholder.png';

    function initAnalytics() {
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

        ga('create', globalSettings.GOOGLE_ANALYTICS_ID, 'auto');
    }

    if (globalSettings.GOOGLE_ANALYTICS_ID) {
        initAnalytics();
    }

    if ($state.current.name === 'layout.root') {
        if (globalSettings.SHOW_HOME && angular.equals({}, $location.search())) {
            $rootScope.showHome = !homeService.getChoice();
        }
    } else {
        $rootScope.showHome = false;
    }

    $rootScope.$on("$stateChangeSuccess",  function (event, toState, toParams, fromState, fromParams) {
        // to be used for back button //won't work when page is reloaded.
        $rootScope.previousState_name = fromState.name;
        $rootScope.currentState_name = toState.name;
    });
    //back button function called from back button's ng-click="back()"
    $rootScope.back = function () {
        if (!$rootScope.previousState_name || $rootScope.previousState_name !== 'layout.root') {
            $state.go('layout.root');
        } else {
            window.history.back();
        }
    };

    $rootScope.$on('startSwitchGlobalLang', function () {
        resultsService.getAllResults(true)
            .then(
                function () {
                    $rootScope.$emit('switchGlobalLang');
                }
            );
    });
}

function HeaderController($rootScope, $scope, globalSettings) {

    $scope.displayHomePage = function () {
        $rootScope.showHome = true;
    };

    $scope.isHomeActive = globalSettings.SHOW_HOME;

    $scope.logo = globalSettings.LOGO_FILE;

}

function SidebarHomeController() {
}

function SidebarDetailController($scope, $rootScope, $modal, $stateParams, $location, globalSettings, resultsService, favoritesService) {

    function getResultDetails(refresh) {
        if ($stateParams.slug) {
            resultsService.getAResultBySlug($stateParams.slug, $stateParams.catSlug)
                .then(
                    function (data) {
                        $scope.result = data;
                    }
                );
        }
    }

    $scope.toggleFavorites = function (currentElement) {
        var currentAction = '';
        if (favoritesService.isInFavorites(currentElement)) {
            currentAction = 'remove';
        } else {
            currentAction = 'add';
        }
        $rootScope.$broadcast('changeFavorite', {element: currentElement, action: currentAction});
    };

    $scope.show3d = function () {
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

    $scope.favIcon = (globalSettings.FAVORITES_ICON ? globalSettings.FAVORITES_ICON : 'heart');
    $scope.isInFavorites = favoritesService.isInFavorites;

    $scope.back = $rootScope.back;

    getResultDetails();

}

function SidebarFlatController() {

}

function FooterController() {
}


module.exports = {
    LayoutController: LayoutController,
    HeaderController: HeaderController,
    SidebarHomeController: SidebarHomeController,
    SidebarDetailController: SidebarDetailController,
    SidebarFlatController: SidebarFlatController,
    FooterController: FooterController
};