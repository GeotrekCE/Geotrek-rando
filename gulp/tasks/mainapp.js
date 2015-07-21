/* browserify task
   ---------------
   Bundle javascripty things with browserify!

   This task is set up to generate multiple separate bundles, from
   different sources, and to use Watchify when run from the default task.

   See browserify.bundleConfigs in gulp/config.js
*/

var gulp = require('gulp');

var mainappTask = function (callback, watchMode) {
    var browserify    = require('browserify');
    var browserSync   = require('browser-sync');
    var watchify      = require('watchify');
    var partialify    = require('partialify');
    var source        = require('vinyl-source-stream');
    var streamify     = require('gulp-streamify');
    var _             = require('lodash');

    var bundleLogger  = require('../util/bundleLogger');
    var handleErrors  = require('../util/handleErrors');
    var config        = require('../config').mainapp;

    var outputName    = config.outputName;
    var outputPath    = config.dest;
    var bundleEntries = config.entries;

    var bundle = function () {
        bundleLogger.start(outputName);

        var localBundle = bundler.bundle();

        localBundle
            .on('error', handleErrors)
            .on('end', function () {
                bundleLogger.end(outputName);
                if (!watchMode) {
                    callback();
                }
            });

        localBundle
            .pipe(source(outputName))
            .pipe(gulp.dest(outputPath));

        localBundle
            .pipe(browserSync.reload({stream: true}));

        return localBundle;
    };

    var bundlerOptions = {
        // Required watchify args
        cache: {},
        packageCache: {},
        fullPaths: false,
        // Specify the entry point of your app
        entries: bundleEntries,
        // Add file extentions to make optional in your requires
        extensions: config.extensions,
        // exclude all externals
        bundleExternal: false
    };

    var bundler = browserify(bundlerOptions);

    bundler.transform(partialify);
    bundler.transform({
        global: true,
        mangle: false
    }, 'uglifyify');

    if (watchMode) {
        // Wrap with watchify and rebundle on changes
        bundler = watchify(bundler);
        // Rebundle on update
        bundler.on('update', bundle);
        bundleLogger.watch(outputName);
    }

    return bundle();
};


gulp.task('mainapp', ['customisation', 'translate'], function (callback) {
    mainappTask(callback, false);
});

gulp.task('watch:mainapp', ['customisation', 'translate'], function (callback) {
    mainappTask(callback, true);
});
