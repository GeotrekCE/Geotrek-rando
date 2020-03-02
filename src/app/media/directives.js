'use strict';

function mediaPlayer() {
    return {
        restrict: 'E',
        replace: true,
        scope: true,
        template: require('./templates/media-modal.html'),
        controller: 'MediaController'
    };
}

module.exports = {
    mediaPlayer: mediaPlayer
};
