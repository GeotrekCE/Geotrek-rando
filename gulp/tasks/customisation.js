'use strict';

var gulp         = require('gulp');
var fs           = require('fs');
var path         = require('path');
var notifier     = require('node-notifier');
var _            = require('lodash');
var config       = require('../config').custom;

function createConfigFile() {
    var configFile = 'src/app/config/settings.custom.json';
    if (!fs.existsSync(configFile)) {
        fs.writeFileSync(configFile, '{}');
    }
}

function getFileType(fileName) {
    if (fileName.match(/^\S*\.(js|coffee)$/gi)) {
        return 'scripts';
    } else if (fileName.match(/^\S*\.(html|coffee)$/gi)) {
        return 'templates';
    } else if (fileName.match(/^\S*\.(css|sass|scss|less)$/gi)) {
        return 'styles';
    } else {
        return false;
    }
}

function touch (file) {
    fs.appendFileSync(file, '');
}

function createCustomisationFiles() {
    [
        'src/app/custom/templates/custom-detail-page-footer.html',
        'src/app/custom/directives.js',
        'src/app/custom/controllers.js',
        'src/app/custom/services.js'
    ].forEach(touch);
}

gulp.task('customisation:config', createConfigFile);


gulp.task('customisation', ['customisation:config'], createCustomisationFiles);

gulp.task('watch:config', function () {
    // gulp.watch(path.join(config.appConfig.path, '!(' + config.appConfig.finalFileName + ').json'), ['customisation:config']);
});
