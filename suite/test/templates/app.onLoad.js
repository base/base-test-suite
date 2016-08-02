'use strict';

var assert = require('assert');

module.exports = function(App, options, runner) {
  var app;

  describe('app.onLoad', function() {
    beforeEach(function() {
      app = new App();
    });

    describe('app.collection', function() {
      it('should emit an onLoad when view is created', function(cb) {
        var collection = app.collection();

        app.on('onLoad', function(view) {
          assert.equal(view.path, 'blog/foo.js');
          cb();
        });

        app.onLoad('blog/:title', function(view, next) {
          assert.equal(view.path, 'blog/foo.js');
          next();
        });

        collection.addView('whatever', {path: 'blog/foo.js', content: 'bar baz'});
      });

      it('should support async loading', function(cb) {
        var collection = app.collection();

        app.onLoad('blog/:title', function(view, next) {
          assert.equal(view.path, 'blog/foo.js');
          next();
        });

        var obj = {path: 'blog/foo.js', content: 'bar baz'};
        collection.addView('whatever', obj, function(err, view) {
          if (err) return cb(err);
          cb();
        });
      });

      it('should expose the view in the callback', function(cb) {
        var collection = app.collection();

        var obj = {path: 'blog/foo.js', content: 'bar baz'};
        collection.addView('whatever', obj, function(err, view) {
          if (err) return cb(err);
          assert(view);
          assert(view.path);
          cb();
        });
      });

      it('should run `.onLoad` middleware before calling the callback', function(cb) {
        var collection = app.collection();

        app.onLoad(/blog/, function(view, next) {
          view.title = 'foo';
          next();
        });

        var obj = {path: 'blog/foo.js', content: 'bar baz'};
        collection.addView('whatever', obj, function(err, view) {
          if (err) return cb(err);
          assert.equal(view.title, 'foo');
          cb();
        });
      });

      it('should be async', function(cb) {
        var collection = app.collection();

        app.onLoad(/blog/, function(view, next) {
          view.title = 'foo';
          setTimeout(function() {
            next();
          }, 20);
        });

        var obj = {path: 'blog/foo.js', content: 'bar baz'};
        collection.addView('whatever', obj, function(err, view) {
          if (err) return cb(err);
          assert.equal(view.title, 'foo');
          cb();
        });
      });
    });

    describe('view collections', function() {
      it('should emit an onLoad when view is created', function(cb) {
        app.create('posts');

        app.on('onLoad', function(view) {
          assert.equal(view.path, 'blog/foo.js');
          cb();
        });

        app.onLoad('blog/:title', function(view, next) {
          assert.equal(view.path, 'blog/foo.js');
          next();
        });

        app.post('whatever', {path: 'blog/foo.js', content: 'bar baz'});
      });
    });
  });
};
