'use strict';

var assert = require('assert');

module.exports = function(App, options, runner) {
  var app;

  describe('app.toStream', function() {
    beforeEach(function() {
      app = new App();
      app.create('pages');
      app.page('a', {content: 'this is A'});
      app.page('b', {content: 'this is B'});
      app.page('c', {content: 'this is C'});

      app.create('posts');
      app.post('x', {content: 'this is X'});
      app.post('y', {content: 'this is Y'});
      app.post('z', {content: 'this is Z'});
    });

    it('should return a stream', function(cb) {
      var stream = app.toStream();
      assert(stream);
      assert(stream.on);
      cb();
    });

    it('should return a stream for a collection', function(cb) {
      var stream = app.toStream('pages');
      assert(stream);
      assert(stream.on);
      cb();
    });

    it('should stack handle multiple collections', function(cb) {
      var files = [];
      app.toStream('pages')
        .pipe(app.toStream('posts'))
        .on('data', function(file) {
          files.push(file);
        })
        .on('end', function() {
          assert.equal(files.length, 6);
          cb();
        });
    });

    it('should push each item in the collection into the stream', function(cb) {
      var files = [];
      app.toStream('pages')
        .on('error', cb)
        .on('data', function(file) {
          assert(file);
          assert(file.path);
          assert(file.contents);
          files.push(file.path);
        })
        .on('end', function() {
          assert.equal(files.length, 3);
          cb();
        });
    });
  });
};
