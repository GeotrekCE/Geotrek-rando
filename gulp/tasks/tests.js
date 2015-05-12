var gulp = require('gulp');

// The protractor task
var protractor = require('gulp-protractor').protractor;

// Download and update the selenium driver
var webdriver_update = require('gulp-protractor').webdriver_update;

// Downloads the selenium webdriver
gulp.task('webdriver_update', webdriver_update);

var webdriver_standalone = require("gulp-protractor").webdriver_standalone;
gulp.task('webdriver_standalone', webdriver_standalone);

// Setting up the test task
gulp.task('tests:e2e', ['webdriver_update'], function(cb) {
    gulp.src(['src/tests/e2e/**/*.specs.js']).pipe(protractor({
        configFile: 'protractor.conf.js',
    })).on('error', function(e) {
        console.log(e)
    }).on('end', cb);
});

gulp.task('tests', [
    'tests:e2e',
]);
