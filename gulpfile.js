var gulp           = require('gulp');
var rename         = require('gulp-rename');
var concat         = require('gulp-concat');
var jshint         = require('gulp-jshint')
var sourcemaps     = require('gulp-sourcemaps');
var stylish        = require('jshint-stylish');
var pngquant       = require('imagemin-pngquant');
var changed        = require('gulp-changed');
var autoprefixer   = require('gulp-autoprefixer')
var jade           = require('gulp-jade');
var compass        = require('gulp-compass');
var sass           = require('gulp-ruby-sass');
var gutil          = require('gulp-util');
var del            = require('del');
var browserSync    = require('browser-sync');
var merge          = require('merge-stream');
var plumber        = require('gulp-plumber');
var notify         = require("gulp-notify");
var uglify         = require('gulp-uglify');
var imagemin       = require('gulp-imagemin');
var minifyCss      = require('gulp-minify-css')
// var reload         = browserSync.reload;

//  編譯來源位置
var sources = {
  config: './src/config/*.js',
  js: './src/javascript/**/*.js',
  sass: './src/sass/**/*.sass',
  jade: './src/*.jade',
  lib: './src/assets/'
};

//  編譯完成位置
var destinations = {
  config: './build/config/',
  js: './build/javascripts/app',
  css: './build/stylesheets',
  html: './build/',
  root: './build/'
};

var syncOPT = {
  logPrefix: "Server",
  browser: "google chrome",
  // open: "external",
  open: false,
  reloadDelay: 1000,
  index: "index.html",
  // https: true,
  // host: "192.168.1.1",
  // logLevel: "debug",
  server: {
    baseDir: './build/'
  },
  port: 8080,
  watchOptions: {debounceDelay: 1000}
}


var compassOPT = {
  // config_file: 'config.rb',
  css: 'build/stylesheets',
  sass: 'src/sass',
  sourcemap: true,
  comments: false,
  // debug: true,
  task: "watch",
  time: true,
  // import_path: true,
  require: ['susy', 'breakpoint']
}



// 清除目標
// if string have the prefix '!', that file or folder won't be deleted.
var cleanArray = [
  './build/*'
];

// Error handeler
// 通知中心錯誤彈出設定
var onError = function (err) {
    console.log('=-=-=-=-=-=-=-=-=-=ERROR_MESSAGE-=-=-=-=-=-=-=-=-=-=-');
    console.log('/////////////////////////////////////////////////////');
    notify.onError({})(err);
    gutil.log(gutil.colors.yellow(err.message));
    console.log('///////////////////ERROR_MESSAGE/////////////////////');
    //gutil.beep();
    browserSync.notify(err.message, 5000);
    return notify(err.message);
};

var JSError = function (file) {
  if (file.jshint.success) {
    return false;
  }
  var errors = file.jshint.results.map(function (data) {
    if (data.error) {
      return "(" + data.error.line + ':' + data.error.character + ') ' + data.error.reason;
    }
  }).join("\n");
    return file.relative + " (" + file.jshint.results.length + " errors)\n" + errors;
}

// 處理 build 初始化的功能
// Clean all of compiled files
gulp.task('clean', function() {
  del.sync(cleanArray);
});

// 處理js
gulp.task('js', function() {
  return gulp.src(sources.js)
  // 檢查js語法
    .pipe(jshint())
    // 語法出錯就會跳訊息
    .pipe(jshint.reporter(stylish))
    .pipe(notify(JSError))
    // .pipe(jshint.reporter('fail'))
    // 將app資料夾中的js合併為一隻
    .pipe(sourcemaps.init())
    .pipe(concat('app.min.js'))
    .pipe(sourcemaps.write())
    // 壓縮js
    .pipe(uglify())
    .on('error', function(err){
      //do whatever here
      // console.log("You have something wrong? Check your js")
      browserSync.notify(err.message, 5000);
      this.end();
    })
    // 輸出
    .pipe(gulp.dest(destinations.js))
});


// Compass Compile
gulp.task('compass', function() {
    var stream =  gulp.src(sources.sass)
    .pipe(compass(compassOPT))
    .on('error' , function (err) {
      console.log('/////////////////////////////////////////////////////');
      console.log('=-=-=-=-=-=-=-=-=-=ERROR_MESSAGE-=-=-=-=-=-=-=-=-=-=-');
      // gutil.log(gutil.colors.yellow(err.message));
      notify.onError({
        title:    "something wrong?",
        // subtitle: "Error: <%= error.message %>",
        message:  "Error: <%= error.message %>",
        sound:    "Frog"
      })(err);
      console.log('=-=-=-=-=-=-=-=-=-=ERROR_MESSAGE-=-=-=-=-=-=-=-=-=-=-');
      console.log('/////////////////////////////////////////////////////');
      // gutil.beep();
      browserSync.notify(err.message, 5000);
      stream.end();
    })
    // .pipe(postcss([ autoprefixer({ browsers: ['last 2 versions', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'] }) ]))
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(minifyCss())
    .pipe(gulp.dest(destinations.css))
    .pipe(reload({stream:true}));
    return stream;
});

// Jade Compile
gulp.task('jade', function() {
  // var YOUR_LOCALS = {};
  var all = gulp.src(sources.jade)
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(changed(destinations.html, {extension: '.html'}))
    // locals: YOUR_LOCALS,
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest(destinations.html));

  var index = gulp.src(sources.jade)
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest(destinations.html));
  // return merge(all, index);
  return merge(index);
});

// Get the library code to build directory
gulp.task('get-lib', function() {
  return gulp.src(sources.lib + '**', {base: sources.lib})
    .pipe(gulp.dest(destinations.root));
});


// Run Server
gulp.task('browser-sync', ['build'], function() {
  browserSync(syncOPT)
});

gulp.task('config', function() {
  return gulp.src(sources.config)
  .pipe(jshint())
  .pipe(jshint.reporter(stylish))
  .pipe(notify(JSError))
  .pipe(uglify())
  .on('error', function(err){
    browserSync.notify(err.message, 5000);
    this.end();
  })
  .pipe(gulp.dest(destinations.config));
})

// Watch files
gulp.task('watch', function() {
  gulp.watch(sources.config, ['config'])
  gulp.watch(sources.js, ['js'])
  gulp.watch(sources.sass, ['compass']);
  gulp.watch(sources.jade, ['jade']);
});


// Livereload
var watchfolder = ['./build/**/*.html','./build/**/*.js' ]
gulp.task('livereload',['watch', 'browser-sync'], function() {
  gulp.watch( watchfolder, function(file) {
    if(file.type === 'changed')
      return reload(file.path);
  });
});

gulp.task('bs-reload', function () {
  reload();
});


gulp.task('compressImg', function () {
  return gulp.src('src/assets/images/*')
      .pipe(imagemin({
          progressive: true,
          svgoPlugins: [{removeViewBox: false}],
          use: [pngquant()]
      }))
      .pipe(gulp.dest('build/images'));
});



// Compile to HTML, CSS, JavaScript
gulp.task('compile', ['clean', 'config' , 'get-lib', 'compass', 'jade', 'js' ,'compressImg']);
gulp.task('build',['compile']);
gulp.task('default',['build', 'livereload']);

