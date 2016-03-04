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
        'src/app/custom/styles/_customisation.scss',

        'src/app/custom/templates/custom-detail-page-footer.html',

        'src/app/custom/directives.js',
        'src/app/custom/controllers.js',
        'src/app/custom/services.js'
    ].forEach(touch);

    [
        'custom/settings.custom.json'
    ].forEach(touchJSON);
}

gulp.task('customisation', touchFiles);
