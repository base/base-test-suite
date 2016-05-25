'use strict';

var path = require('path');
var assert = require('assert');
var rimraf = require('rimraf');
var File = require('vinyl');
var afs = require('assemble-fs');
var fixtures = path.resolve.bind(path, __dirname, 'fixtures');

module.exports = function(App, options, runner) {
  var app;

  describe('stream handlers', function() {
    beforeEach(function() {
      app = new App();
      app.use(afs());
    });

    afterEach(function(cb) {
      rimraf(fixtures('out-fixtures/'), cb);
    });

    it('should handle onLoad', function(cb) {
      var count = 0;
      app.onLoad(/./, function(file, next) {
        count++;
        next();
      });

      app.src(fixtures('vinyl/test.coffee'))
        .pipe(app.dest('out-fixtures/', {cwd: fixtures()}))
        .on('end', function() {
          assert.equal(count, 1);
          cb();
        });
    });

    it('should handle preWrite', function(cb) {
      var count = 0;
      app.preWrite(/./, function(file, next) {
        count++;
        next();
      });

      var srcPath = fixtures('vinyl/test.coffee');
      var stream = app.dest('out-fixtures/', {
        cwd: __dirname
      });

      stream.once('finish', function() {
        assert.equal(count, 1);
        cb();
      });

      var file = new File({
        path: srcPath,
        cwd: __dirname,
        contents: new Buffer("1234567890")
      });
      file.options = {};

      stream.write(file);
      stream.end();
    });

    it('should handle postWrite', function(cb) {
      var count = 0;
      app.postWrite(/./, function(file, next) {
        count++;
        next();
      });

      var srcPath = fixtures('fixtures/vinyl/test.coffee');
      var stream = app.dest('out-fixtures/', {
        cwd: __dirname
      });

      stream.once('finish', function() {
        assert.equal(count, 1);
        cb();
      });

      var file = new File({
        path: srcPath,
        cwd: __dirname,
        contents: new Buffer("1234567890")
      });
      file.options = {};

      stream.write(file);
      stream.end();
    });
  });
};
