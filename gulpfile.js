'use strict';

var gulp = require('gulp'),
    concat = require('gulp-concat'),
    Server = require('karma').Server,
    wrap = require('gulp-wrap');

var paths = {
  src: [
    'src/module.js',
    'src/model.js',
    'src/httpStore.js'
  ],
  dist: 'dougal.js'
};

gulp.task('dist', function () {
  return gulp.src(paths.src)
    .pipe(concat(paths.dist))
    .pipe(wrap({src: 'src/wrap.js.tpl'}))
    .pipe(gulp.dest('.'));
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
