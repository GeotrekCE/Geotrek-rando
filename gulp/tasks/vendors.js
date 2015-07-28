'use strict';

var gulp         = require('gulp');
var PACKAGE      = require('../../package.json');

var browserify   = require('browserify');
var source       = require('vinyl-source-stream');
var streamify    = require('gulp-streamify');

var handleErrors = require('../util/handleErrors');
var bundleLogger = require('../util/bundleLogger');
var config       = require('../config').vendors;

gulp.task('vendors', function () {

    var bundler    = browserify();
    var outputName = config.outputName;
    var outputPath = config.dest;

    for (var key in PACKAGE.vendors) {
        bundler.require(
            PACKAGE.vendors[key],
            {expose: key}
        );
    }

    // Use partialify to allow Angular templates to be require()
    bundler.transform(require('partialify'));
    bundler.transform({
        global: true
    }, 'uglifyify');

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
