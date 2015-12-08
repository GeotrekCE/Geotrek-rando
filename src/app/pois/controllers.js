'use strict';

function PoisListeController($scope, $rootScope, globalSettings, utilsFactory, $modal) {

    $scope.poiExpanded = globalSettings.POI_EXPANDED;

    $scope.hoverMarkerPoi = function (currentPoi, state) {

        currentPoi.mouseover = state === 'enter';

        var layerEquivalent = document.querySelector('.layer-' + currentPoi.properties.type.id + '-' + currentPoi.id);
        if (!layerEquivalent) {
            var mapLayers = [];
            $rootScope.map.eachLayer(function (currentLayer) {
                if (currentLayer._childCount) {
                    mapLayers.push(currentLayer);
                }
            });
            var position = utilsFactory.getStartPoint(currentPoi);
            var cluster = L.GeometryUtil.closestLayer($rootScope.map, mapLayers, position);

            if (cluster) {
                layerEquivalent = cluster.layer._icon;
            }
        }
        if (layerEquivalent) {
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

    $scope.showLightbox = function (images, slideIndex) {
        var modal = $modal.open({
            templateUrl: '/app/gallery/templates/lightbox-gallery.html',
            controller: 'GalleryController',
            windowClass: 'lightbox',
            resolve: {
                images: function () {
                    return images;
                },
                slideIndex: function () {
                    return slideIndex;
                }
            }
        });
    };

    function initPois() {
        updateFilesUrl();
        initListeClasses();
    }

    function initListeClasses() {
        $scope.isOpened = {};
        _.each($scope.pois, function (poi) {
            $scope.isOpened[poi.id] = 'closed';
        });
    }

    function updateFilesUrl() {
        _.each($scope.pois, function (poi) {
            _.each(poi.properties.files, function (file) {
                file.url = globalSettings.API_URL + file.url;
            });
        });
    }

    $scope.togglePoi = function (poiId) {
        if ($scope.isOpened[poiId] === 'closed') {
            document.querySelector('.informations').classList.add('collapsed');
            document.querySelector('.interests').classList.add('expend');
            document.querySelector('.detail-map').classList.add('expend');
            _.forEach($scope.isOpened, function (isOpenedValue, index) {
                if (parseInt(index, 10) === parseInt(poiId, 10)) {
                    $scope.isOpened[index] = 'opened';
                } else {
                    $scope.isOpened[index] = 'is-hidden';
                }
            });
        } else {
            document.querySelector('.informations').classList.remove('collapsed');
            document.querySelector('.interests').classList.remove('expend');
            document.querySelector('.detail-map').classList.remove('expend');
            _.forEach($scope.isOpened, function (isOpenedValue, index) {
                $scope.isOpened[index] = 'closed';
            });
        }
    };

    $scope.openPlayer = function (media) {
        var mediaModal = $modal.open({
            templateUrl: 'app/pois/templates/media-modal.html',
            controller: 'MediaController',
            resolve: {
                media: function () {
                    return media;
                }
            }
        });
    };

    initPois();

    var rootScopeEvents = [ $rootScope.$on('resetPOIGallery', initPois) ];

    $scope.$on('$destroy', function () { rootScopeEvents.forEach(function (dereg) { dereg(); }); });

}

function MediaController(media, $scope, $timeout, $modalInstance) {
    function initPlayer() {
        var player = document.createElement('iframe');
        player.width = '100%';
        player.height = '100%';
        player.frameborder = '0';
        player.setAttribute('allowfullscreen', '');
        player.setAttribute('webkitallowfullscreen', '');
        player.setAttribute('mozallowfullscreen', '');
        player.src = media.url;
        document.querySelector('#media-player').appendChild(player);

    }

    $scope.close = function () {
        $modalInstance.dismiss('close');
    };

    $timeout(initPlayer, 500);
}

module.exports = {
    PoisListeController: PoisListeController,
    MediaController: MediaController
};
