'use strict';

var gulp       = require('gulp');

var watchify   = require('watchify');
var browserify = require('browserify');

var partialify = require('partialify');

var source     = require('vinyl-source-stream');
var buffer     = require('vinyl-buffer');
var gutil      = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var assign     = require('lodash.assign');

// add custom browserify options here
var customOpts = {
    entries: ['./src/app/app.js'],
    debug: true
};

var opts  = assign({}, watchify.args, customOpts);

gulp.task('mainapp', ['customisation', 'translate'], function () {
    return bundle(false);
});

gulp.task('watch:mainapp', ['customisation', 'translate'], function () {
    return bundle(true);
});

function bundle(watch) {
    var b = browserify(opts);

    if (watch) {
        b = watchify(b);
    }

    // Transforms
    b.transform(partialify);
    b.transform({
        global: true,
        mangle: false
    }, 'uglifyify');

    b.on('update', bundle);  // On any dep update, runs the bundler
    b.on('log', gutil.log);  // Output build logs to terminal

    return b.bundle()
        // Log errors if they happen
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))

        .pipe(source('rando.js'))
        // optional, remove if you don't need to buffer file contents
        .pipe(buffer())
        // optional, remove if you dont want sourcemaps
        .pipe(sourcemaps.init({
            loadMaps: true
        })) // loads map from browserify file
        // Add transformation tasks to the pipeline here.
        .pipe(sourcemaps.write('./')) // writes .map file
        .pipe(gulp.dest('./src'));
}
