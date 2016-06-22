'use strict';

var _ = require('lodash'),
    gulp = require('gulp'),
    browserify = require('gulp-browserify'),
    eslint = require('gulp-eslint'),
    rename = require('gulp-rename'),
    Server = require('karma').Server,
    shell = require('gulp-shell');

var paths = {
  src: [
    'src/module.js',
    'src/collection.js',
    'src/extend.js',
    'src/model.js',
    'src/httpStore.js'
  ],
  dist: 'dougal.js',
  tests: 'test/*-spec.js'
};

paths.allFiles = _.flatten([paths.src, paths.tests]);

gulp.task('default', ['doc', 'lint:unsafe'], function () {
  gulp.start('watch:test');
  gulp.watch(paths.allFiles, ['lint:unsafe']);
  return gulp.watch(paths.src, ['doc', 'dist']);
});

gulp.task('dist', function () {
  return gulp.src('src/module.js')
    .pipe(browserify())
    .pipe(rename(paths.dist))
    .pipe(gulp.dest('.'));
});

gulp.task('doc', shell.task('./node_modules/.bin/jsdoc --configure jsdoc.conf.json --destination doc'));

gulp.task('lint', function () {
  return gulp.src(paths.allFiles)
    .pipe(eslint('./.eslintrc'))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('lint:unsafe', function () {
  return gulp.src(paths.allFiles)
    .pipe(eslint('./.eslintrc'))
    .pipe(eslint.format());
});

gulp.task('test', ['dist'], function (done) {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
});

gulp.task('watch:test', ['dist'], function (done) {
  new Server({
    configFile: __dirname + '/karma.conf.js'
  }, done).start();
});
