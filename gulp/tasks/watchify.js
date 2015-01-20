var gulp = require('gulp');
var browserifyTask = require('./browserify');

gulp.task('watchify', function (callback) {
    browserifyTask(callback, true);
});
