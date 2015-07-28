'use strict';

var gulp        = require('gulp');
var po2json     = require('gulp-po2json');
var config      = require('../config').translate;

gulp.task('translate', ['customisation'], function () {
    return gulp.src(config.src)
        .pipe(po2json(config.options))
        .pipe(gulp.dest(config.dest));
});

gulp.task('watch:translate', function () {
    gulp.watch(config.src, ['translate']);
});
