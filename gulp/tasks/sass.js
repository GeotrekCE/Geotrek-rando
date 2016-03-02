'use strict';

var gulp         = require('gulp');
var merge        = require('merge-stream');
var gulpif       = require('gulp-if');

var sass         = require('gulp-sass');
var rename       = require("gulp-rename");
var sourcemaps   = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');

var handleErrors = require('../util/handleErrors');
var config       = require('../config').sass;

var fs           = require('fs');

var srcMap       = false;

function compileSass() {
    var streams = [];
    config.files.forEach(function (element) {

        streams.push(gulp.src(element.src)
            .on('error', handleErrors)
            .pipe(gulpif(srcMap, sourcemaps.init()))
            .pipe(sass(config.settings))
            .pipe(autoprefixer({ browsers: ['last 2 version'] }))
            .pipe(gulpif(srcMap, sourcemaps.write()))
            .pipe(rename(element.outputName)) // Setup the right filename
            .pipe(gulp.dest(config.dest))    // Output in specified directory
        );

    });

    return merge(streams);
}

function sassConfig() {
    var configFile = 'src/app/config/styles/_config-custom.scss';
    if (!fs.existsSync(configFile)) {
        fs.writeFileSync(configFile, '');
    }
}

function sassCustomisation() {
    var configFile = 'src/app/custom/styles/_customisation.scss';
    if (!fs.existsSync(configFile)) {
        fs.writeFileSync(configFile, '');
    }
}

gulp.task('sass:config', sassConfig);
gulp.task('sass:customisation', sassCustomisation);

gulp.task('sass', ['sass:config', 'sass:customisation'], compileSass);

gulp.task('watch:sass', function () {
    gulp.watch(config.toWatch, ['sass']);
});
