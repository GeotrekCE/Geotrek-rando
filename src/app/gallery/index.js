'use strict';

var angular = require('angular');

angular.module('rando.gallery', [])
    .controller('GalleryController', require('./controllers').GalleryController)
    .directive('lightboxGallery', require('./directives').lightboxGallery);