'use strict';

var gulp         = require('gulp');
var fs           = require('fs');
var path         = require('path');
var notifier     = require('node-notifier');
var _            = require('lodash');
var config       = require('../config').custom;

function createConfigFile() {
    var appConfig   = config.appConfig;
    var configPath  = appConfig.path;
    var defaultConf = fs.readFileSync(path.join(configPath, appConfig.defaultFileName), {encoding: 'utf8'});
    var customConf  = '{}';
    var finalConf   = {};
    var finalFile   = path.join(configPath, appConfig.finalFileName);
    if(fs.existsSync(path.join(configPath, appConfig.customFileName))) {
        customConf = fs.readFileSync(path.join(configPath, appConfig.customFileName), {encoding: 'utf8'});
    }
    finalConf = _.assign(JSON.parse(defaultConf), JSON.parse(customConf));

    fs.writeFile(finalFile, JSON.stringify(finalConf), function (err) {
        if (err) {
            console.log('Eror - Couldn\'t write file: ' + finalFile);
            throw err;
        }
    });
}

function getFileType(fileName) {
    if (fileName.match(/^\S*\.(js|coffee)$/gi)) {
        return 'scripts';
    } else if (fileName.match(/^\S*\.(html|coffee)$/gi)) {
        return 'templates';
    } else if (fileName.match(/^\S*\.(css|sass|scss|less)$/gi)) {
        return 'styles';
    } else {
        return false;
    }
}

function createCustomisationFiles() {


    _.each(config.filesToCreate, function (file) {
        var fileType = getFileType(file.customFileName);
        var filePath = '';
        var fileContent = '';
        if (file.path) {
            filePath = file.path;
        } else {
            filePath = config.customModulePath;
            if (fileType) {
                filePath = path.join(filePath, config[fileType + 'Folder']);
            } else {
                var message = 'The format of "' + file.customFileName + '" isn\'t recognise.';
                console.log(message);
                notifier.notify({
                    'title': 'Invalid file format',
                    'message': message
                });
                return false;
            }
        }

        if (!fs.existsSync(path.join(filePath, file.customFileName))) {
            console.log('file ' + file.customFileName + ' doesn\'t exists ---- creating it !');
            if (file.defaultFileName) {
                fileContent = fs.readFileSync(path.join(filePath, file.defaultFileName));
            }

            fs.appendFileSync(path.join(filePath, file.customFileName), fileContent);
        }
    });
}

gulp.task('customisation:config', createConfigFile);


gulp.task('customisation', ['customisation:config'], createCustomisationFiles);

gulp.task('watch:config', function () {
    gulp.watch(path.join(config.appConfig.path, '!(' + config.appConfig.finalFileName + ').json'), ['customisation:config']);
});