'use strict';

/* Notes:
   - gulp/tasks/mainapp.js handles js recompiling with watchify
   - gulp/tasks/browserSync.js watches and reloads compiled files
*/

var gulp     = require('gulp');
var config   = require('../config');

gulp.task('watch', ['watch:mainapp', 'browserSync'], function () {
    gulp.watch(config.sass.toWatch, ['sass']);
    gulp.watch(config.translate.src, ['mainapp']);
    // Watchify will watch and recompile our JS, so no need to gulp.watch it
});
