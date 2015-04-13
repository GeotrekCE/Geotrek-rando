'use strict';

function PoisListeController($scope, $rootScope, utilsFactory, $modal) {

    $scope.hoverMarkerPoi = function (currentPoi, state) {
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

    function initListeClasses() {
        $scope.isOpened = {};
        _.each($scope.pois, function (poi) {
            $scope.isOpened[poi.id] = 'closed';
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
                    $scope.isOpened[index] = 'hidden';
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

    initListeClasses();
    $rootScope.$on('resetPOIGallery', function () {
        initListeClasses();
    });
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
        if (media.backend === 'Youtube') {

            player.src = 'https://www.youtube.com/embed/' + media.code + '?rel=0&amp;controls=0&amp;showinfo=0';

        } else if (media.backend === 'Vimeo') {

            player.src = 'https://player.vimeo.com/video/' + media.code + '?title=0&byline=0&portrait=0';

        } else if (media.backend === 'SoundCloud') {

            player.scrolling = "no";
            player.src = 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/' + media.code + '&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true';

        }
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