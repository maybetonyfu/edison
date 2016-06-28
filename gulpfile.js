'use strict';

var gulp = require('gulp');
var babel = require('gulp-babel');

var GULP_FILE = ['gulpfile.js'];
var SRC_FILES = ['src/**/*.js'];
var COMPILED_SRC_DIR = 'dist';

gulp.task('default', function (done) {
  gulp.src(SRC_FILES)
    .pipe(babel())
    .pipe(gulp.dest(COMPILED_SRC_DIR))
    .on('finish', done);
});
