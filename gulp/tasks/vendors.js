var browserify = require('browserify');
var source = require('vinyl-source-stream');
var partialify = require('partialify');
var streamify = require('gulp-streamify');
var gulp = require('gulp');
var handleErrors = require('../util/handleErrors');
var bundleLogger = require('../util/bundleLogger');
var config = require('../config').vendors;
var uglify = require('gulp-uglify');
var PACKAGE = require('../../package.json');
var exorcist = require('exorcist');
var _ = require('lodash');
var src = [], key;

gulp.task('vendors', function () {

    var key;
    var bundler = browserify({
        // Enable source maps if true
        debug: config.debug
    });

    for (key in PACKAGE.browser) {

        if (global.distMode) {
            if (config.dist_ignore.indexOf(key) === -1) {
                bundler.require(
                    PACKAGE.browser[key],
                    {expose: key}
                );
            }
        } else {

            bundler.require(
                PACKAGE.browser[key],
                {expose: key}
            );

        }

    }

    // Use partialify to allow Angular templates to be require()
    bundler.transform(partialify);

    // Log when bundling starts
    bundleLogger.start(config.outputName);

    return bundler
        .bundle()
        .on('error', handleErrors)
        .pipe(exorcist(
            config.dest + '/maps/' + config.outputName + '.map'
        ))
        .pipe(source(config.outputName))
        .pipe(streamify(uglify()))
        .pipe(gulp.dest(config.dest))
        .on('end', function () {
            // Log when bundling completes
            bundleLogger.end(config.outputName);
        });

});
