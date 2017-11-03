'use strict';

var gulp         = require('gulp');
var merge        = require('merge-stream');
var gulpif       = require('gulp-if');

var sass         = require('gulp-sass');
var rename       = require("gulp-rename");
var sourcemaps   = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');

var handleErrors = require('../util/handleErrors');

var fs           = require('fs');

var srcMap       = false;

var sassSettings = {
    outputStyle: 'compact',
    imagePath: '/images'
};

function touch (file) {
    fs.appendFileSync(file, '');
}

function compileSass() {
    var streams = [];

    [
        {
            src: 'src/app/rando.scss',
            dest: 'rando.css'
        },
        {
            src: 'src/app/vendors/styles/vendors.{sass,scss}',
            dest: 'rando-vendors.css'
        }
    ].forEach(function (element) {

        streams.push(gulp.src(element.src)
            .on('error', handleErrors)
            .pipe(gulpif(srcMap, sourcemaps.init()))
            .pipe(sass(sassSettings))
            .pipe(autoprefixer({ browsers: ['last 2 version'] }))
            .pipe(gulpif(srcMap, sourcemaps.write()))
            .pipe(rename(element.dest)) // Setup the right filename
            .pipe(gulp.dest('dist/public/styles'))    // Output in specified directory
        );

    });

    return merge(streams);
}

gulp.task('sass', compileSass);

gulp.task('watch:sass', function () {
    gulp.watch('src/app/**/*.scss', ['sass']);
});
