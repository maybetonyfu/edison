'use strict';

var gulp = require('gulp');
var babel = require('gulp-babel');
var eslint = require('gulp-eslint')

// var GULP_FILE = ['gulpfile.js'];
var SRC_FILES = ['src/**/*.js'];
var COMPILED_SRC_DIR = 'dist';

gulp.task('lint', function () {
    // ESLint ignores files with "node_modules" paths.
    // So, it's best to have gulp ignore the directory as well.
    // Also, Be sure to return the stream from the task;
    // Otherwise, the task may end before the stream has finished.
    return gulp.src(['src/**/*.js','!node_modules/**'])
        // eslint() attaches the lint output to the "eslint" property
        // of the file object so it can be used by other modules.
        .pipe(eslint())
        // eslint.format() outputs the lint results to the console.
        // Alternatively use eslint.formatEach() (see Docs).
        .pipe(eslint.format())
        // To have the process exit with an error code (1) on
        // lint error, return the stream and pipe to failAfterError last.
        .pipe(eslint.failAfterError());
});

gulp.task('compile', function (done) {
  gulp.src(SRC_FILES)
    .pipe(babel())
    .pipe(gulp.dest(COMPILED_SRC_DIR))
    .on('finish', done);
});

gulp.task('default', ['lint', 'compile']);