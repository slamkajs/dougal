'use strict';

var gulp = require('gulp'),
    concat = require('gulp-concat'),
    eslint = require('gulp-eslint'),
    Server = require('karma').Server,
    shell = require('gulp-shell'),
    wrap = require('gulp-wrap');

var paths = {
  src: [
    'src/module.js',
    'src/model.js',
    'src/httpStore.js'
  ],
  dist: 'dougal.js',
  tests: 'test/*-spec.js'
};

gulp.task('default', ['doc', 'lint:unsafe', 'dist'], function () {
  gulp.start('watch:test');
  return gulp.watch(paths.src, ['doc', 'lint:unsafe', 'dist']);
});

gulp.task('dist', function () {
  return gulp.src(paths.src)
    .pipe(concat(paths.dist))
    .pipe(wrap({src: 'src/wrap.js.tpl'}))
    .pipe(gulp.dest('.'));
});

gulp.task('doc', shell.task('./node_modules/.bin/jsdoc --configure jsdoc.conf.json --destination doc'));

gulp.task('lint', function () {
  return gulp.src(paths.src)
    .pipe(eslint('./.eslintrc'))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('lint:unsafe', function () {
  return gulp.src(paths.src)
    .pipe(eslint('./.eslintrc'))
    .pipe(eslint.format());
});

gulp.task('test', function (done) {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
});

gulp.task('watch:test', function (done) {
  new Server({
    configFile: __dirname + '/karma.conf.js'
  }, done).start();
});
