var gulp = require('gulp');
var merge = require('merge-stream');
var config = require('../config').icons;
var _ = require('lodash');

gulp.task('icons', function () {

    var merged = merge();

    _.forEach(config.frameworks, function (framework) {
        var stream = gulp.src(framework.src)
            .pipe(gulp.dest(config.dest + framework.dest_folder));
        merged.add(stream);
    });

    return merged;
});