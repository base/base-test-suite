'use strict';

var gulp = require('gulp');
var through = require('through2');

gulp.task('convert', function() {
  return gulp.src('suite/test/templates/*.js')
    .pipe(through.obj(function(file, enc, next) {
      var str = file.contents.toString();
      var lines = str.split('\n');
      lines = lines.map(function(line) {
        return strictEquals(line);
      });
      file.contents = new Buffer(lines.join('\n'));
      next(null, file);
    }))
    .pipe(gulp.dest('suite/test/templates'));
});

gulp.task('default', ['convert']);

function strictEquals(line) {
  if (/assert\(.*? === /.test(line)) {
    return line.split('assert(')
      .join('assert.equal(')
      .split(' === ')
      .join(', ');
  }
  return line;
}
