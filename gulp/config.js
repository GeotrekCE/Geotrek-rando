var dest      = './src';
var src       = './src';
var appFolder = 'app';

module.exports = {
    unit: {
        tests: ['src/**/test/unit/*.js'],
        src: ['src/*/*.js']
    },
    browserSync: {
        server: {
            // Serve up our build folder
            baseDir: dest
        }
    },
    translate: {
        src: [
            src + '/' + appFolder + '/translation/po/*.po'
        ],
        dest: dest + '/' + appFolder + '/translation/lang',
        options: {
            'format': 'mf'
        }
    },
    sass: {
        files: [
            {
                src: src + '/' + appFolder + '/rando.{sass,scss}',
                outputName: 'rando.css'
            },
            {
                src: src + '/' + appFolder + '/vendors/styles/vendors.{sass,scss}',
                outputName: 'rando-vendors.css'
            }
        ],
        dest: dest,
        toWatch: src + '/' + appFolder + '/**/*.scss',
        settings: {
            outputStyle: 'compact',
            imagePath: '/images' // Used by the image-url helper
        }
    },
    images: {
        frameworks: [
            {
                src: './node_modules/leaflet/dist/images/*',
                dest_folder: 'leaflet'
            },
            {
                src: './node_modules/leaflet.fullscreen/*.png',
                dest_folder: 'leaflet-fullscreen'
            },
            {
                src: './node_modules/leaflet-minimap/src/images/*',
                dest_folder: 'leaflet_minimap'
            }
        ],
        dest: dest + appFolder + '/vendors/images'
    },
    icons: {
        frameworks: [
            {
                src: './node_modules/bootstrap-sass/assets/fonts/bootstrap/*',
                dest_folder: 'bootstrap'
            }
        ],
        dest: dest + appFolder + '/vendors/fonts'
    },
    vendors: {
        outputName : 'rando-vendors.js',
        dest: dest
    },
    browserify: {
        debug: true,
        entries: src + '/' + appFolder + '/app.js',
        dest: dest,
        outputName: 'rando.js'
    },
    production: {
        cssSrc: dest + '/*.css',
        jsSrc: dest + '/*.js',
        dest: dest
    },
    custom: {
        customModulePath: src + '/' + appFolder + '/custom',
        templatesFolder: 'templates',
        stylesFolder: 'styles',
        scriptsFolder: '',
        appConfig: {
            path: src + '/' + appFolder + '/config/',
            defaultFileName: 'configs-default.js',
            customFileName: 'configs.js',
            varName: 'constants'
        },
        filesToCreate: [
            {
                path: src + '/' + appFolder + '/config/styles/',
                defaultFileName: '_config-default.scss',
                customFileName: '_config.scss'
            },
            {
                path: '',
                defaultFileName: '',
                customFileName: '_custom-footer.scss'
            },
            {
                path: '',
                defaultFileName: '',
                customFileName: 'custom-footer.html'
            },
            {
                path: '',
                defaultFileName: '',
                customFileName: '_custom-header.scss'
            },
            {
                path: '',
                defaultFileName: '',
                customFileName: 'custom-header.html'
            },
            {
                path: '',
                defaultFileName: '',
                customFileName: 'custom-detail-page-footer.html'
            },
            {
                path: '',
                defaultFileName: '',
                customFileName: '_custom-home.scss'
            },
            {
                path: '',
                defaultFileName: '',
                customFileName: 'custom-home-fr.html'
            },
            {
                path: '',
                defaultFileName: '',
                customFileName: 'custom-home-en.html'
            },
            {
                path: '',
                defaultFileName: '',
                customFileName: '_custom-override.scss'
            },
            {
                path: '',
                defaultFileName: 'directives.js.example',
                customFileName: 'directives.js'
            },
            {
                path: '',
                defaultFileName: 'controllers.js.example',
                customFileName: 'controllers.js'
            },
            {
                path: '',
                defaultFileName: 'services.js.example',
                customFileName: 'services.js'
            },
            {
                path: src + '/' + appFolder + '/translation/po/',
                defaultFileName: 'fr-custom.po.example',
                customFileName: 'fr-custom.po'
            },
            {
                path: src + '/' + appFolder + '/translation/po/',
                defaultFileName: 'en-custom.po.example',
                customFileName: 'en-custom.po'
            },
            {
                path: src + '/' + appFolder + '/translation/po/',
                defaultFileName: 'de-custom.po.example',
                customFileName: 'de-custom.po'
            },
            {
                path: src + '/' + appFolder + '/translation/po/',
                defaultFileName: 'nl-custom.po.example',
                customFileName: 'nl-custom.po'
            },
        ],
        languages: {
            enable: true,
            configListeVarName: 'AVAILABLE_LANGUAGES',
            pathToPoFolder: src + '/' + appFolder + "/translation/po",
            useExample: true
        }
    }
};
