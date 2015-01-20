var gulp = require('gulp');
var buildMode = require('../config').buildMode;

if (buildMode.dist) {
    gulp.task('default', ['dist']);
} else {
    gulp.task('default', ['watch']);
}
