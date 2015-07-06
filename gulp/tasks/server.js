var gulp       = require('gulp');
var portfinder = require('portfinder');
var connect    = require('gulp-connect');

gulp.task('server', function(cb) {
    portfinder.basePort = 3000;
    portfinder.getPort(function (err, port) {
        if (err) return;
        connect.server({
            root: 'src',
            port: port,
        });
    });
});
