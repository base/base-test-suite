'use strict';

var gulp = require('gulp');
var converter = require('base-test-converter');
var condense = require('gulp-condense');

gulp.task('fixtures', function() {
  return gulp.src('suite/test/templates/fixtures/**')
    .pipe(gulp.dest('suite/test/templates/fixtures'));
});

gulp.task('support', function() {
  return gulp.src('suite/test/templates/support/**')
    .pipe(gulp.dest('suite/test/templates/support'));
});

gulp.task('convert', ['fixtures', 'support'], function() {
  return gulp.src('suite/test/templates/*.js')
    .pipe(converter())
    .pipe(condense())
    .pipe(gulp.dest('suite/test/templates'));
});

gulp.task('default', ['convert']);
