"use strict";

var gulp = require("gulp");
var babel = require("gulp-babel");
var eslint = require("gulp-eslint");
var exec = require("gulp-exec");

var SRC_FILES = ["src/**/*.js"];
var COMPILED_SRC_DIR = "dist";

gulp.task("init", function (done) {
    gulp.src("./**/**")
        .pipe(exec("mkdir -p data/demand/NSW"))
        .pipe(exec("mkdir -p data/demand/QLD"))
        .pipe(exec("mkdir -p data/demand/SA"))
        .pipe(exec("mkdir -p data/demand/TAS"))
        .pipe(exec("mkdir -p data/demand/VIC"))
        .on("finish", done);
});

gulp.task("lint", function (done) {
    gulp.src(SRC_FILES)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
        .on("finish", done);
});

gulp.task("compile", function (done) {
    gulp.src(SRC_FILES)
        .pipe(babel())
        .pipe(gulp.dest(COMPILED_SRC_DIR))
        .on("finish", done);
});

gulp.task("default", ["lint", "compile"]);