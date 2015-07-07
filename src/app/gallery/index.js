'use strict';

angular.module('rando.gallery', ['ui.bootstrap'])
    .controller('GalleryController', require('./controllers').GalleryController)
    .directive('lightboxGallery', require('./directives').lightboxGallery);
