var fs           = require('fs');
var path         = require('path');
var bundleLogger = require('../util/bundleLogger');
var notifier     = require('node-notifier');
var gulp         = require('gulp');
var _            = require('lodash');
var config       = require('../config').custom;
var prefix       = '/../.';

function customisationTask() {
    var self = this;

    //First - read custom config file
    //
    var configFile = path.join(__dirname, prefix + config.appConfig.path + config.appConfig.customFileName);
    var defaultConfigFile = path.join(__dirname, prefix + config.appConfig.path + config.appConfig.defaultFileName);

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

    if (!fs.existsSync(configFile)) {
        console.log('Custom config file doesn\'t exist ---- creating it !');
        if (fs.existsSync(defaultConfigFile)) {
            var defaultConfig = fs.readFileSync(defaultConfigFile);
            fs.appendFileSync(configFile, defaultConfig);
        } else {
            notifier.notify({
                'title': 'File missing',
                'message': 'Default config file "' + defaultConfigFile + '" doesn\'t exist. You must create it.'
            });
            self.emit('end');
        }
            
    }

    if (config.languages.enable) {
        var appConfig = require(configFile)[config.appConfig.varName];
        var languages = appConfig[config.languages.configListeVarName];
        var langFilesPath = config.languages.pathToPoFolder;

        _.each(languages, function (lang) {
            var fileName = lang.code + '-custom.po';
            var fileContent = '';
            if (!fs.existsSync(path.join(langFilesPath, fileName))) {
                if (config.languages.useExample) {
                    if (fs.existsSync(path.join(langFilesPath, fileName + '.example'))) {
                        fileContent = fs.readFileSync(path.join(langFilesPath, fileName + '.example'));
                    } else {
                        notifier.notify({
                            'title': 'File missing',
                            'message': 'Example po file "' + path.join(langFilesPath, fileName + '.example') + '" doesn\'t exist. You must create it.'
                        });
                        self.emit('end');
                    }
                }

                fs.appendFileSync(path.join(langFilesPath, fileName), fileContent);
            }

        });
    }

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
                notifier.notify({
                    'title': 'Invalid file format',
                    'message': 'The format of "' + file.customFileName + '" isn\'t recognise.'
                });
                self.emit('end');
            }
        }

        if (!fs.existsSync(path.join(filePath, file.customFileName))) {
            console.log('file' + file.customFileName + ' doesn\'t exists ---- creating it !');
            if (file.defaultFileName) {
                fileContent = fs.readFileSync(path.join(filePath, file.defaultFileName));
            }

            fs.appendFileSync(path.join(filePath, file.customFileName), fileContent);
        }
        
    });
}

gulp.task('customisation', customisationTask);

module.exports = customisationTask;