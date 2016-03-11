'use strict';

/* Notes:
   - gulp/tasks/mainapp.js handles js recompiling with watchify
   - gulp/tasks/browserSync.js watches and reloads compiled files
*/

var gulp     = require('gulp');

gulp.task('watch', ['watch:mainapp', 'watch:sass', 'watch:translate']);
