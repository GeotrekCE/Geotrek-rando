var gulp        = require('gulp');
var po2json     = require('gulp-po2json');
var config      = require('../config').translate;

var translateTask = function () {
    return gulp.src(config.src)
        .pipe(po2json(config.options))
        .pipe(gulp.dest(config.dest));
};

gulp.task('translate', translateTask);

module.exports = translateTask;
