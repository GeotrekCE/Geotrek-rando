'use strict';

var gulp        = require('gulp');
var sort        = require('gulp-sort');
var po2json     = require('gulp-po2json');
var jsoncombine = require('gulp-jsoncombine');

gulp.task('translate', function () {
    return gulp.src(['src/app/translation/po/*.po'])
        .pipe(po2json({ format: 'mf' }))
        .pipe(sort({ asc: false }))
        .pipe(jsoncombine('lang.json', function (data) {

            Object.keys(data).forEach(function (key) {
                var split = key.split('-');
                var lang;
                if (split.length > 1) {
                    lang = split[0];
                    require('lodash').assign(data[lang], data[key]);
                    delete data[key];
                }
            });

            return new Buffer(JSON.stringify(data));
        }))
        .pipe(gulp.dest('src/app/translation/lang'));
});

gulp.task('watch:translate', function () {
    gulp.watch(
        'src/app/translation/po/**/*.po',
        ['translate']);
});
