'use strict';

var gulp         = require('gulp');
var concat       = require('gulp-concat');
var merge        = require('merge-stream');
var path         = require('path');
var gulpif       = require('gulp-if');
var sort         = require('gulp-sort');
var browserSync  = require('browser-sync');

var sass         = require('gulp-sass');
var rename       = require("gulp-rename");
var sourcemaps   = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');

var handleErrors = require('../util/handleErrors');
var config       = require('../config').sass;

var srcMap       = false;
var brwSync      = true;

function concatConfigFiles() {
    var appConfig   = config.config;
    var configPath  = appConfig.path;
    return gulp.src(path.join(configPath, '!(' + appConfig.finalFileName + ').scss'))
        .pipe(sort({
            asc: false
        }))
        .pipe(concat(appConfig.finalFileName + '.scss'))
        .pipe(gulp.dest(configPath));
}

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
            .pipe(gulpif(brwSync, browserSync.reload({stream:true})))
        );

    });

    return merge(streams);
}

gulp.task('sass:config', concatConfigFiles);

gulp.task('sass', ['sass:config'], compileSass);

gulp.task('watch:sass', function () {
    gulp.watch(config.toWatch, ['sass']);
});