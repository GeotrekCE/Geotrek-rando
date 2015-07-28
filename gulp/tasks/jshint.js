'use strict';

/* browserify task
   ---------------
   Bundle javascripty things with browserify!

   This task is set up to generate multiple separate bundles, from
   different sources, and to use Watchify when run from the default task.

   See browserify.bundleConfigs in gulp/config.js
*/

var gulp        = require('gulp');
var jshint      = require('gulp-jshint');

var handleErrors  = require('../util/handleErrors');
var config        = require('../config');

gulp.task('jshint', function () {
	var src = [
		'src/app/**/*.js',
		'!src/app/vendors/**/*.js'
	];

    gulp.src(src)
    	// .pipe(console.log)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));

       // var path = require('path');
       // console.log(path.resolve(src));
});
