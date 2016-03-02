'use strict';

var gulp         = require('gulp');

var browserify   = require('browserify');
var source       = require('vinyl-source-stream');

var handleErrors = require('../util/handleErrors');
var bundleLogger = require('../util/bundleLogger');

gulp.task('rando3D', function () {

    var bundler    = browserify();
    var outputName = 'rando-3D.js';
    var outputPath = 'src';

    bundler.require('rando3D');

    // Use partialify to allow Angular templates to be require()
    // bundler.transform(require('partialify'));
    // bundler.transform({
    //     global: true
    // }, 'uglifyify');

    // Log when bundling starts
    bundleLogger.start(outputName);

    var bundle = bundler.bundle();

    bundle
        .on('error', handleErrors)
        .on('end', function () { bundleLogger.end(outputName); });

    bundle
        .pipe(source(outputName))     // Setup the right filename
        .pipe(gulp.dest(outputPath)); // Output in specified directory

    return bundle;
});
