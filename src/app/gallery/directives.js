'use strict';

var controllers = require('./controllers');

function lightboxGallery() {
    return {
        restrict: 'E',
        replace: true,
        scope: true,
        template: require('./templates/lightbox-gallery.html'),
        controller: controllers.GalleryController
    };
}

module.exports = {
    lightboxGallery: lightboxGallery
};