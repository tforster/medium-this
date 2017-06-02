var del = require('del'),
  gulp = require('gulp'),
  debug = require('gulp-debug'),
  htmlmin = require('gulp-htmlmin'),
  minifyCss = require('gulp-minify-css'),
  rename = require('gulp-rename'),
  rev = require('gulp-rev'),
  uglify = require('gulp-uglify'),
  usemin = require('gulp-usemin'),
  util = require('gulp-util'),
  watch = require('gulp-watch');

/**
 * CONFIG
 * - General configuration for this project
 */
let config = {}


/**
 * COPYRESOURCES
 * - Copies resources provided in resources hash
 */
let copyResources = (resources) => {
  return Promise.all(resources.map(function (resource) {
    return new Promise(function (resolve, reject) {
      gulp.src(resource.glob)
        .on('error', reject)
        .pipe(gulp.dest(config.buildPath + resource.dest))
        .on('end', resolve)
    });
  }));
}


/**
 * MINH
 * - Minifies and concatenates globbed .HTML files including nested Javascript and CSS resources
 * - WARNING: Currently unused as gulp-uglify cannot handle ES6 syntax just yet.
 */
let minh = () => {
  return new Promise(function (resolve, reject) {
    gulp.src(config.buildPath + '/*.html')
      .on('error', reject)
      .pipe(debug())
      .pipe(usemin({
        css: [function () { return minifyCss(); }, function () { return rev(); }],
        html: [function () { return htmlmin({ collapseWhitespace: true, removeComments: true }); }],
        js: [function () { return uglify({ 'negate_iife': false }); }, function () { return rev(); }],
        inlinejs: [uglify()],
        inlinecss: [minifyCss(), 'concat']
      }))
      .pipe(gulp.dest(config.buildPath))
      .on('end', resolve);
  })
}


/**
 * BUILD
 * - The actual build pipeline that clears a target, compiles views, copies images and fonts, minifies and cleans up
 */
let build = async () => {
  // if (config.target !== 'dev') {
  //   console.error('gulp-uglify does not support ES6 yet. Exiting...')
  //   return;
  // }
  await del([config.buildPath + '**/*']);
  let c = await copyResources([
    {
      glob: ['./src/res/manifest.json'],
      dest: '/'
    },
    {
      glob: ['./src/views/**/*.html'],
      dest: '/'
    },
    {
      glob: ['./src/img/**/*'],
      dest: '/img/'
    },
    {
      glob: ['./src/js/**/*.js'],
      dest: '/js/'
    },
    {
      glob: ['./src/css/**/*'],
      dest: '/css/'
    }
  ]);

  // Stage and Prod have single JS and CSS so we can clean up the unminified files
  if (config.target !== 'dev') {
    await minh();
    // Cleanup temporary CSS created prior to minification (JS will happen after UglifyJS supports ES6)
    c = await del([config.buildPath + '/css']);
  }
  return c;
}


/**
 * TEST
 * - Used for occasional prototyping and testing of new gulp tasks
 */
gulp.task('test', function () {

});


/**
 * BUILD
 * - A gulp task wrapper around build()
 */
gulp.task('build', function () {
  return build(); // Currently no promise wrapped around build()!
})


/**
 * WATCH
 * - Watches src/ and automatically builds into build/dev
 */
gulp.task('watch', function () {
  // Some hacky sh!t for build and deploy needs to be cleaned up a bit
  return watch('src/**/*', function () {
    build()
      .then(result => {
        gulp.start('build');
      })
  });
});


/** 
 * HELP
 * - Display some basic help info
 */
gulp.task('help', function () {
  console.log(`
  
  Usage: gulp <command> [options]
    
    where <command> is one of:
      build:   Clean, compile views, copy resources, optionally minify and clean up
      deploy:  Synchronize the local target (e.g. dev, stage or prod) with AWS S3
      watch:   Starts a watcher on src and updates any changes to build/dev

    options:
      --target [dev] | stage | prod
  
  `)
});


/**
 * DEFAULT
 * - Show the help message
 */
gulp.task('default', ['help']);


/**
 * Set up the config object defaults based on --target flag
 */
(function () {
  config.target = util.env.target || 'dev';
  switch (config.target.toLowerCase()) {
    case 'stage':
      config.buildPath = 'build/stage/';
      break;
    case 'prod':
      config.buildPath = 'build/prod/';
      break;
    default:
      config.buildPath = 'build/dev/';
      break;
  }
})();
