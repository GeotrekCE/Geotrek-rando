'use strict';

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

    $scope.close = function close () {
        $modalInstance.dismiss('close');
    };

    $timeout(initPlayer, 500);

}

module.exports = {
    MediaController: MediaController
};
