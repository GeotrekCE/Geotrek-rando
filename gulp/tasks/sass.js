var gulp         = require('gulp');
var browserSync  = require('browser-sync');
var sass         = require('gulp-sass');
var rename       = require("gulp-rename");
var sourcemaps   = require('gulp-sourcemaps');
var handleErrors = require('../util/handleErrors');
var config       = require('../config').sass;
var autoprefixer = require('gulp-autoprefixer');

gulp.task('sass', function () {

    function compileSass(element, index) {
        gulp.src(element.src)
            .pipe(sourcemaps.init())
            .pipe(sass(config.settings))
            .on('error', handleErrors)
            .pipe(sourcemaps.write())
            .pipe(autoprefixer({ browsers: ['last 2 version'] }))
            .pipe(rename(element.outputName))
            .pipe(gulp.dest(config.dest))
            .pipe(browserSync.reload({stream:true}));
    }

    config.files.forEach(compileSass);
    return true;
  
});
