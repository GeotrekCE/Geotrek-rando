var gulp    = require('gulp');
var concat  = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var config  = require('../config').vendors;
var uglify = require('gulp-uglify');
var PACKAGE = require('../../package.json');
var src = [], key;

for (key in PACKAGE.browser) {
    src.push(PACKAGE.browser[key]);
}

gulp.task('vendors', function () {
    return gulp.src(src)
        .pipe(sourcemaps.init())
        .pipe(concat(config.outputName))
        .pipe(uglify())
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest(config.dest));
});
