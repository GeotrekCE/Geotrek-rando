'use strict';

function LayoutController($rootScope, $scope, $state, $location, resultsService, filtersService, globalSettings, homeService, $translate, $timeout, Analytics, mapService) {
    $rootScope.currentState_name = $state.current.name;
    $rootScope.showFooterOnApp = globalSettings.SHOW_FOOTER;
    $rootScope.elementsLoading = 0;
    $rootScope.mapIsShown = true;
    $rootScope.placeHolderImage = globalSettings.PLACEHOLDER_IMAGE ? '/custom/images/' + globalSettings.PLACEHOLDER_IMAGE : '/images/placeholder.png';
    $rootScope.favoriteIcon = (globalSettings.FAVORITES_ICON ? globalSettings.FAVORITES_ICON : 'heart');

    var bowser          = require('bowser');
    $rootScope.isChrome = !!bowser.chrome;
    $rootScope.isIE     = !!bowser.msie;
    $rootScope.isEdge   = !!bowser.msedge;
    $rootScope.isSafari = !!bowser.safari;
    $rootScope.isWebkit = !!bowser.webkit;

    var base = '';
    if (globalSettings.FAVICON) {
        base = '/custom/images/';
        $rootScope.favIcon = {
            png: base + globalSettings.FAVICON.png,
            ico: base + globalSettings.FAVICON.ico
        };
    } else {
        base = '/images/';
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

    $scope.accessSpecificCategory = function accessSpecificCategory (currentCategory) {
        $state.go('layout.root');
        if (typeof currentCategory !== 'object') {
            currentCategory = [currentCategory];
        }
        $rootScope.activeFilters.categories = currentCategory;
        filtersService.updateActiveFilters($rootScope.activeFilters);
        $rootScope.$broadcast('updateResultsList', true);

        $rootScope.activeFiltersTags = filtersService.getTagFilters();

        if ($rootScope.showHome) {
            $rootScope.showHome = false;
        }
    };

    $scope.accessSpecificDistrict = function accessSpecificDistrict (currentDistrict) {
        $state.go('layout.root');
        if (typeof currentDistrict !== 'object') {
            currentDistrict = [currentDistrict];
        }
        $rootScope.activeFilters.districts = currentDistrict;
        filtersService.updateActiveFilters($rootScope.activeFilters);
        $rootScope.$broadcast('updateResultsList', true);

        $rootScope.activeFiltersTags = filtersService.getTagFilters();

        if ($rootScope.showHome) {
            $rootScope.showHome = false;
        }
    };

    $scope.accessSpecificCategoryAndRoute = function accessSpecificCategoryAndRoute (currentCategory, currentRoute) {
        $state.go('layout.root');
        if (typeof currentCategory !== 'object') {
            currentCategory = [currentCategory];
        }
        if (typeof currentRoute !== 'object') {
            currentRoute = [currentRoute];
        }
        $rootScope.activeFilters.categories = currentCategory;
        $rootScope.activeFilters[currentCategory + "_route"] = currentRoute;
        filtersService.updateActiveFilters($rootScope.activeFilters);
        $rootScope.$broadcast('updateResultsList', true);

        $rootScope.activeFiltersTags = filtersService.getTagFilters();

        if ($rootScope.showHome) {
            $rootScope.showHome = false;
        }
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
            resultsService.getAllResults()
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

function SidebarDetailController($scope, $window, $rootScope, $modal, $stateParams, $location, globalSettings, resultsService, favoritesService, webglService, Analytics) {

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
            template: require('../3d/templates/rando-3d.html'),
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

    $scope.gaDownloadGPX = function(item) {
        if (globalSettings.GOOGLE_ANALYTICS_ID) {
            Analytics.send('event', 'GPX', 'download', item.properties.slug);
        }
        $window.open(item.properties.gpx, "_self")
    };

    $scope.gaDownloadKML = function(item) {
        if (globalSettings.GOOGLE_ANALYTICS_ID) {
            Analytics.send('event', 'KML', 'download', item.properties.slug);
        }
        $window.open(item.properties.kml, "_self")
    };

    if (globalSettings.PDF_LINK_IN_DOWNLOAD) {
        $scope.pdfLinkInDownload = true;
    } else {
        $scope.pdfLinkInDownload = false;
    }

    $scope.gaDownloadPDF = function(item) {
        if (globalSettings.GOOGLE_ANALYTICS_ID) {
            Analytics.send('event', 'PDF', 'download', item.properties.slug);
        }
        $window.open(item.properties.printable, "_blank")
    };

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
