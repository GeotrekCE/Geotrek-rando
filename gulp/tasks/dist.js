var gulp = require('gulp');

gulp.task('dist', ['customisation', 'browserify', 'sass', 'vendors']);