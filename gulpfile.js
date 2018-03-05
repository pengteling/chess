var gulp = require("gulp");
var babel = require("gulp-babel");
var browserify = require("gulp-browserify")
var plumber = require('gulp-plumber')

gulp.task("es6to5", function () {
  return gulp.src("src/**/*.js")
    .pipe(plumber())
    .pipe(babel())
    .pipe(gulp.dest("js"));
});


// Basic usage 
gulp.task('default', ["es6to5"], function () {
  // Single entry point to browserify 
  gulp.src('js/comm.js')
    .pipe(plumber())
    .pipe(browserify({
      //insertGlobals: true,
      debug: true
    }))
    .pipe(gulp.dest('./build'))
});

gulp.watch("src/**/*.js", ["es6to5","default"]);