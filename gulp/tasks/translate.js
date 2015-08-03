'use strict';

var fs      = require('fs');
var gulp    = require('gulp');
var concat  = require('gulp-concat');
var sort    = require('gulp-sort');
var po2json = require('gulp-po2json');
var config  = require('../config').translate;

gulp.task('translate', function () {

    fs.readdir(config.src, function (err, files) {
        for (var i = files.length - 1; i >= 0; i--) {
            var file = files[i];
            var stats = fs.statSync(config.src + '/' + file);
            if (stats.isDirectory()) {
                gulp.src(config.src + '/' + file + '/*.po')
                    .pipe(sort({
                        asc: false
                    }))
                    .pipe(concat(file + '.po'))
                    .pipe(po2json(config.options))
                    .pipe(gulp.dest(config.dest));
            }
        }
        return true;
    });
});

gulp.task('watch:translate', function () {
    gulp.watch(config.src, ['translate']);
});