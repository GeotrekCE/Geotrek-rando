'use strict';

/* browserify task
   ---------------
   Bundle javascripty things with browserify!

   This task is set up to generate multiple separate bundles, from
   different sources, and to use Watchify when run from the default task.

   See browserify.bundleConfigs in gulp/config.js
*/

var gulp          = require('gulp');
var browserify    = require('browserify');
var source        = require('vinyl-source-stream');
var watchify      = require('watchify');
var browserSync   = require('browser-sync');
var gulpif        = require('gulp-if');
var exorcist      = require('exorcist');
var jshint        = require('gulp-jshint');
var path          = require('path');

var partialify    = require('partialify');

var bundleLogger  = require('../util/bundleLogger');
var handleErrors  = require('../util/handleErrors');
var config        = require('../config').mainapp;

var outputName    = config.outputName;
var outputPath    = config.dest;
var bundleEntries = config.entries;

var watch         = false;
var srcMap        = false;
var brwSync       = true;

gulp.task('mainapp', ['customisation', 'translate'], function(){
    browserifyShare();
});

gulp.task('watch:mainapp', ['customisation', 'translate'], function(){
    watch = true;
    browserifyShare();
});

function browserifyShare() {
    var b = browserify({
        cache: {},
        packageCache: {},
        fullPaths: false,
        entries: bundleEntries,
        extensions: config.extensions,
        bundleExternal: false,
        debug: srcMap
    });

    b.transform(partialify);

    b.transform({
        global: true,
        mangle: false
    }, 'uglifyify');

    if (watch) {
        // if watch is enable, wrap this bundle inside watchify
        b = watchify(b);
        bundleLogger.watch(outputName);
        b.on('update', function (filename) {
            if (path.extname(filename) === '.js') {
              gulp.src(filename)
                  .pipe(jshint())
                  .pipe(jshint.reporter('jshint-stylish'));
            }

            bundleShare(b);
        });
    }

    return bundleShare(b);
}


function bundleShare(b) {
    bundleLogger.start(outputName);

    return b.bundle()
        .on('error', handleErrors)
        .on('end', function () { bundleLogger.end(outputName); })
        .pipe(gulpif(srcMap, exorcist(outputPath + '/maps/' + outputName + '.map', 'maps/' + outputName + '.map')))
        .pipe(source(outputName))
        .pipe(gulp.dest(outputPath))
        .pipe(gulpif(brwSync && watch, browserSync.reload({stream: true})));
}
