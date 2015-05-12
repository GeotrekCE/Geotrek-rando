var gulp = require('gulp');

// The protractor task
var protractor = require('gulp-protractor').protractor;

// Download and update the selenium driver
var webdriver_update = require('gulp-protractor').webdriver_update;

// Downloads the selenium webdriver
gulp.task('webdriver_update', webdriver_update);

var webdriver_standalone = require("gulp-protractor").webdriver_standalone;
gulp.task('webdriver_standalone', webdriver_standalone);


var portfinder = require('portfinder');
var connect    = require('gulp-connect');


// Setting up the test task
gulp.task('tests:e2e', ['webdriver_update'], function(cb) {

    portfinder.getPort(function (err, port) {
        if (err) return;

        connect.server({
            root: 'src',
            port: port,
        });

        gulp.src(['src/tests/e2e/**/*.specs.js']).pipe(protractor({
            configFile: 'protractor.conf.js',
            args: [
                '--baseUrl', 'http://localhost:' + port
            ]
        })).on('error', function(e) {
            connect.serverClose();
            console.log(e)
        }).on('end', connect.serverClose)
        .on('end', cb);
    });
});

gulp.task('tests', [
    'tests:e2e',
]);
