var distMode = (process.argv.slice(2).indexOf('--dist') >= 0);
var vendorsMode = (process.argv.slice(2).indexOf('--vendors') >= 0);
var dest = './src',
    src = './src',
    appFolder = 'app';


module.exports = {
    unit: {
        tests: ['src/**/test/unit/*.js'],
        src: ['src/*/*.js']
    },
    buildMode: {
        dist: distMode,
        vendors: vendorsMode
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
        src: src + '/' + appFolder + '/rando.{sass,scss}',
        dest: dest,
        toWatch: src + '/' + appFolder + '/**/*.scss',
        settings: {
            // Required if you want to use SASS syntax
            // See https://github.com/dlmanning/gulp-sass/issues/81
            sourceComments: 'map',
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
        debug: true,
        outputName : 'rando-vendors.js',
        dest: dest,
        dist_ignore: [
            "angular-mocks"
        ]
    },
    browserify: {
        debug: true,
        // A separate bundle will be generated for each
        // bundle config in the list below
        bundleConfigs: [
            {
                entries: src + '/' + appFolder + '/app.js',
                dest: dest,
                outputName: 'rando.js'
            }
        ]
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
                customFileName: '_custom-home.scss'
            },
            {
                path: '',
                defaultFileName: '',
                customFileName: 'custom-home.html'
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
            }
        ],
        languages: {
            enable: true,
            configListeVarName: 'AVAILABLE_LANGUAGES',
            pathToPoFolder: src + '/' + appFolder + "/translation/po",
            useExample: true
        }
    }
};
