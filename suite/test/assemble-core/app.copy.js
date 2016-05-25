'use strict';

var path = require('path');
var assert = require('assert');

module.exports = function(App, options, runner) {
  var fixtures = path.join(__dirname, 'fixtures/copy/*.txt');
  var actual = path.join(__dirname, 'actual');
  var rimraf = require('rimraf');
  var app;

  describe('app.copy', function() {
    beforeEach(function(cb) {
      rimraf(actual, cb);
      app = new App();
    });

    afterEach(function(cb) {
      rimraf(actual, cb);
    });

    describe('streams', function() {
      it('should copy files', function(cb) {
        app.copy(fixtures, path.join(__dirname, 'actual'))
          .on('error', cb)
          .on('data', function(file) {
            assert.equal(typeof file, 'object');
          })
          .on('end', cb);
      });
    });
  });
};
