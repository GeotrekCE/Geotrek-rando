var dest = './src',
    src = './src',
    appFolder = 'app';


module.exports = {
  browserSync: {
    server: {
      // Serve up our build folder
      baseDir: dest
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
  // images: {
  //   src: src + "/images/**",
  //   dest: dest + "/images"
  // },
  // markup: {
  //   src: src + "/htdocs/**",
  //   dest: dest
  // },
  vendors: {
    outputName : 'rando-vendors.js',
    dest: dest
  },
  browserify: {
    debug: true,
    // A separate bundle will be generated for each
    // bundle config in the list below
    bundleConfigs: [{
      entries: src + '/' + appFolder + '/app.js',
      dest: dest,
      outputName: 'rando.js'
    }]
  },
  production: {
    cssSrc: dest + '/*.css',
    jsSrc: dest + '/*.js',
    dest: dest
  }
};
