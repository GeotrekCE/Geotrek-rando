var gulp         = require('gulp');
var gulpif       = require('gulp-if');
var browserSync  = require('browser-sync');

var sass         = require('gulp-sass');
var rename       = require("gulp-rename");
var sourcemaps   = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');

var handleErrors = require('../util/handleErrors');
var config       = require('../config').sass;

var srcMap       = false;
var brwSync      = true;

gulp.task('sass', function () {

    config.files.forEach(function (element) {
        var stream = gulp.src(element.src);

        stream
            .on('error', handleErrors);

        stream
            .pipe(gulpif(srcMap, sourcemaps.init()))
            .pipe(sass(config.settings))
            .pipe(autoprefixer({ browsers: ['last 2 version'] }))
            .pipe(gulpif(srcMap, sourcemaps.write()))
            .pipe(rename(element.outputName)) // Setup the right filename
            .pipe(gulp.dest(config.dest));    // Output in specified directory

        stream
            .pipe(gulpif(brwSync, browserSync.reload({stream:true})));
    });
});
