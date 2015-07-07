'use strict';

function lightboxGallery() {
    return {
        restrict: 'E',
        replace: true,
        scope: true,
        template: require('./templates/lightbox-gallery.html'),
        controller: 'GalleryController'
    };
}

module.exports = {
    lightboxGallery: lightboxGallery
};