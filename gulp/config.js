'use strict';

var dest      = './src';
var src       = './src';
var appFolder = 'app';

module.exports = {
    images: {
        frameworks: [
            {
                src: './node_modules/leaflet/dist/images/*',
                dest_folder: 'leaflet'
            },
            {
                src: './node_modules/leaflet.fullscreen/*.png',
                dest_folder: 'leaflet-fullscreen'
            },
            {
                src: './node_modules/leaflet-minimap/src/images/*',
                dest_folder: 'leaflet_minimap'
            }
        ],
        dest: dest + appFolder + '/vendors/images'
    },
    icons: {
        frameworks: [
            {
                src: './node_modules/bootstrap-sass/assets/fonts/bootstrap/*',
                dest_folder: 'bootstrap'
            }
        ],
        dest: dest + appFolder + '/vendors/fonts'
    },
    vendors: {
        outputName : 'rando-vendors.js',
        dest: dest
    },
    mainapp: {
        debug: true,
        entries: src + '/' + appFolder + '/app.js',
        dest: dest,
        outputName: 'rando.js'
    },
    production: {
        cssSrc: dest + '/*.css',
        jsSrc: dest + '/*.js',
        dest: dest
    }
};
