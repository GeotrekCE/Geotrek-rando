'use strict';

var gulp         = require('gulp');
var fs           = require('fs');

function touch (file) {
    fs.appendFileSync(file, '');
}

function touchJSON (file) {
    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, '{}');
    }
}

function touchFiles() {
    [
        'custom/_configuration.scss',
        'custom/_customisation.scss',

        'custom/custom-detail-page-footer.html',

        'custom/directives.js',
        'custom/controllers.js',
        'custom/services.js'
    ].forEach(touch);

    [
        'custom/settings.custom.json'
    ].forEach(touchJSON);
}

gulp.task('customisation', touchFiles);
