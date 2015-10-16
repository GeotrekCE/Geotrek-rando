'use strict';

/* browserify task
   ---------------
   Bundle javascripty things with browserify!

   This task is set up to generate multiple separate bundles, from
   different sources, and to use Watchify when run from the default task.

   See browserify.bundleConfigs in gulp/config.js
*/

var gulp   = require('gulp');
var tar    = require('gulp-tar');
var gzip   = require('gulp-gzip');
var rename = require('gulp-rename');

var handleErrors  = require('../util/handleErrors');
var config        = require('../config');


gulp.task('tgz:custo', function() {
    gulp.src([
      './src/images/**/custom/**/*',

      './src/app/config/styles/_config-custom.scss',
      './src/app/custom/controllers.js',
      './src/app/custom/directives.js',
      './src/app/custom/styles/_custom-footer.scss',
      './src/app/custom/styles/_custom-header.scss',
      './src/app/custom/styles/_custom-home.scss',
      './src/app/custom/styles/_custom-override.scss',
      './src/app/custom/templates/custom-detail-page-footer.html',
      './src/app/custom/templates/custom-footer.html',
      './src/app/custom/templates/custom-header.html',
      './src/app/custom/templates/custom-home-feed.html',
      './src/app/custom/templates/custom-home-video.html',

      './src/app/custom/templates/custom-home-*.html',

      './src/app/translation/**/*-custom.po'
    ])
    .pipe(rename(function (path) {
      if (path.extname === '.po') {
        path.dirname = '';
      }
      return path;
    }))
    .pipe(tar((new Date()).toISOString().split('T')[0] + '-custo.tar'))
    .pipe(gzip())
    .pipe(gulp.dest('./'));
});























