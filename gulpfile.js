'use strict';

const gulp = require('gulp');
const plumber = require('gulp-plumber');
const less = require('gulp-less');
const prefix = require('gulp-autoprefixer');
const csso = require('gulp-csso');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var tsify = require('tsify');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var buffer = require('vinyl-buffer');

gulp.task('build-less', function () {
    return gulp
        .src('./src/less/style.less')
        .pipe(plumber())
        .pipe(less({
            javascriptEnabled: true,
        }))
        .pipe(prefix({
            grid: true,
        }))
        .pipe(csso({comments: false}))
        .pipe(gulp.dest('./dist'));
});

gulp.task('build-ts', function () {
    return browserify({
        basedir: '.',
        debug: true,
        entries: ['src/ts/index.ts'],
        cache: {},
        packageCache: {}
    })
        .plugin(tsify)
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist'));
});

gulp.task('build', gulp.parallel('build-ts', 'build-less'));
