var dest = './app',
    src = './app',
    stylesFolder = 'styles',
    modulesFolder = 'modules';


module.exports = {
  browserSync: {
    server: {
      // Serve up our build folder
      baseDir: dest
    }
  },
  sass: {
    src: src + '/' + stylesFolder + "/sass/rando.{sass,scss}",
    dest: dest + '/' + stylesFolder,
    settings: {
      // Required if you want to use SASS syntax
      // See https://github.com/dlmanning/gulp-sass/issues/81
      sourceComments: 'map',
      imagePath: '/images' // Used by the image-url helper
    }
  },
  // images: {
  //   src: src + "/images/**",
  //   dest: dest + "/images"
  // },
  // markup: {
  //   src: src + "/htdocs/**",
  //   dest: dest
  // },
  browserify: {
    // A separate bundle will be generated for each
    // bundle config in the list below
    bundleConfigs: [{
      entries: src + '/' + modulesFolder + '/app.js',
      dest: dest,
      outputName: 'rando.js',
      // list of externally available modules to exclude from the bundle
      external: []
    }]
  },
  production: {
    cssSrc: dest + '/*.css',
    jsSrc: dest + '/*.js',
    dest: dest
  }
};
