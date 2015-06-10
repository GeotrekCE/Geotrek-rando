/* browserify task
   ---------------
   Bundle javascripty things with browserify!

   This task is set up to generate multiple separate bundles, from
   different sources, and to use Watchify when run from the default task.

   See browserify.bundleConfigs in gulp/config.js
*/

var browserify   = require('browserify');
var browserSync  = require('browser-sync');
var watchify     = require('watchify');
var partialify   = require('partialify');
var bundleLogger = require('../util/bundleLogger');
var gulp         = require('gulp');
var handleErrors = require('../util/handleErrors');
var source       = require('vinyl-source-stream');
var streamify    = require('gulp-streamify');
var uglify       = require('gulp-uglify');
var exorcist     = require('exorcist');
var config       = require('../config').browserify;
var _            = require('lodash');
var translateTask = require('./translate');
var custoTask = require('./customisation');


var browserifyTask = function (callback, devMode) {

    var bundleQueue = config.bundleConfigs.length;

    var browserifyThis = function (bundleConfig) {

        var reportFinished = function () {
            // Log when bundling completes
            bundleLogger.end(bundleConfig.outputName);

            if (bundleQueue) {
                bundleQueue--;
                if (bundleQueue === 0) {
                    // If queue is empty, tell gulp the task is complete.
                    // https://github.com/gulpjs/gulp/blob/master/docs/API.md#accept-a-callback
                    callback();
                }
            }
        };

        var bundler = browserify({
            // Required watchify args
            cache: {},
            packageCache: {},
            fullPaths: false,
            // Specify the entry point of your app
            entries: bundleConfig.entries,
            // Add file extentions to make optional in your requires
            extensions: config.extensions,
            // exclude all externals
            bundleExternal: false,
            // Enable source maps!
            debug: config.debug
        })
            .transform(partialify);

        var bundle = function () {
            // Log when bundling starts
            bundleLogger.start(bundleConfig.outputName);

            return bundler
                .bundle()
                // Report compile errors
                .on('error', handleErrors)
                // Use vinyl-source-stream to make the
                // stream gulp compatible. Specify the
                // desired output filename here.
                .pipe(source(bundleConfig.outputName))
                //.pipe(streamify(uglify()))
                // Specify the output destination
                .pipe(gulp.dest(bundleConfig.dest))
                .on('end', reportFinished)
                .pipe(browserSync.reload({stream: true}));
        };

        if (devMode) {
            // Wrap with watchify and rebundle on changes
            bundler = watchify(bundler);
            // Rebundle on update
            bundler.on('update', bundle);
            bundleLogger.watch(bundleConfig.outputName);
        }

        return bundle();
    };
    custoTask();
    translateTask();
    setTimeout(function () {
        config.bundleConfigs.forEach(browserifyThis);
    }, 500);
};

gulp.task('browserify', browserifyTask);

module.exports = browserifyTask;

