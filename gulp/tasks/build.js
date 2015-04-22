var gulp = require('gulp');
var buildMode = require('../config').buildMode;

if (buildMode.vendors) {
    gulp.task('build', [
        'customisation',
        'browserify',
        'vendors',
        'sass'
    ]);
} else {
    gulp.task('build', [
        'customisation',
        'browserify',
        'sass'
    ]);
}
