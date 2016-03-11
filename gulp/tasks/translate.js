'use strict';

var gulp        = require('gulp');
var sort        = require('gulp-sort');
var po2json     = require('gulp-po2json');
var jsoncombine = require('gulp-jsoncombine');

function getKey (string) {
    var arr = string.split('/');
    var len = arr.length;
    return arr[len - 1];
}

gulp.task('translate', function () {
    return gulp.src(['src/app/translation/**/*.po'])
        .pipe(po2json({ format: 'mf' }))
        .pipe(sort({ asc: false }))
        .pipe(jsoncombine('default.json', function (input) {
            var output = {};
            var all    = Object.keys(input);

            all.forEach(function (poPath) {
                var key      = getKey(poPath);
                var previous = output[key] || {};
                output[key]  = require('lodash').assign(previous, input[poPath]);
            });

            return new Buffer(JSON.stringify(output));
        }))
        .pipe(gulp.dest('dist/translations'));
});

gulp.task('watch:translate', function () {
    gulp.watch(
        'src/app/translation/po/**/*.po',
        ['translate']);
});
