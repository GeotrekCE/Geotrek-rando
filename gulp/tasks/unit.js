var gulp = require('gulp'),
    mocha = require('gulp-mocha'),
    istanbul = require('gulp-istanbul'),
    conf = require('../config').unit;

gulp.task('unit', function (cb) {
    gulp.src(conf.src)
        .pipe(istanbul())
        .pipe(istanbul.hookRequire())
        .on('finish', function () {
            gulp.src(conf.tests)
                .pipe(mocha({reporter: 'dot'}))
                .pipe(istanbul.writeReports())
                .on('end', cb);
        })
});