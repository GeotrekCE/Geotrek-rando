'use strict';

var fs      = require('fs');
var merge   = require('merge-stream');
var gulp    = require('gulp');
var concat  = require('gulp-concat');
var sort    = require('gulp-sort');
var po2json = require('gulp-po2json');
var config  = require('../config').translate;

gulp.task('translate', ['translate:concat', 'translate:byLang']);

gulp.task('translate:concat', ['translate:byLang'], function () {
    var regexFile = /^(\w+).\w+$/i;
    var finalFile = config.dest + '/lang.json';
    fs.readdir(config.dest, function (err, files) {
        var translations = {};
        for (var i = files.length - 1; i >= 0; i--) {
            var fileName = files[i];
            if (fileName.match(regexFile) && fileName !== 'lang.json') {
                var lang = regexFile.exec(fileName)[1];
                translations[lang] = require('../../' + config.dest + '/' + fileName);
            }
        }
        fs.writeFile(finalFile, JSON.stringify(translations), function (err) {
            if (err) {
                console.log('Eror - Couldn\'t write file: ' + finalFile);
                throw err;
            }
        });
    });
});

gulp.task('translate:byLang', function () {
    var streamArray = [];
    var files = fs.readdirSync(config.src);
    for (var i = files.length - 1; i >= 0; i--) {
        var folder = files[i];
        var stats = fs.statSync(config.src + '/' + folder);
        if (stats.isDirectory()) {
            streamArray.push(
                gulp.src(config.src + '/' + folder + '/*.po')
                    .pipe(sort({
                        asc: false
                    }))
                    .pipe(concat(folder + '.po'))
                    .pipe(po2json(config.options))
                    .pipe(gulp.dest(config.dest))
            );
        }
    }
    return merge(streamArray);
});

gulp.task('watch:translate', function () {
    gulp.watch(config.src, ['translate']);
});