'use strict';

var assert = require('assert');

module.exports = function(App, options, runner) {
  var app;

  describe('app.events', function() {
    describe('events', function() {
      beforeEach(function() {
        app = new App();
      });

      it('should listen for an event:', function() {
        app = new App();
        app.on('foo', function() {});
        assert(Array.isArray(app._callbacks['$foo']));
      });

      it('should emit an event:', function(cb) {
        app = new App();
        app.on('foo', function(val) {
          assert.equal(val, 'bar');
          cb();
        });
        assert(Array.isArray(app._callbacks['$foo']));
        app.emit('foo', 'bar');
      });

      it('should listen for `view` events:', function(cb) {
        app = new App();
        var count = 0;

        app.on('view', function(view) {
          view.foo = 'bar';
          count++;
        });

        var view = app.view({path: 'a', content: 'b'});
        assert.equal(view.foo, 'bar');
        assert.equal(count, 1);
        cb();
      });
    });

    describe('onLoad', function() {
      beforeEach(function() {
        app = new App();
      });

      describe('app.collection', function() {
        it('should emit a `view` event when view is created', function(cb) {
          var collection = app.collection();

          app.on('view', function(view) {
            assert.equal(view.path, 'blog/foo.js');
            cb();
          });

          app.onLoad('blog/:title', function(view, next) {
            assert.equal(view.path, 'blog/foo.js');
            next();
          });

          collection.addView('whatever', {path: 'blog/foo.js', content: 'bar baz'});
        });

        it('should emit an onLoad event when view is created', function(cb) {
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

        it('should not emit an onLoad event when view is created and `app.options.onLoad` is `false', function(cb) {
          var emitted = false;
          var handled = false;
          var collection = app.collection();
          app.options.onLoad = false;

          app.on('onLoad', function(view) {
            emitted = true;
          });

          app.onLoad('blog/:title', function(view, next) {
            handled = true;
            next();
          });

          collection.addView('whatever', {path: 'blog/foo.js', content: 'bar baz'});
          setImmediate(function() {
            assert.equal(typeof collection.views.whatever, 'object');
            assert.equal(emitted, false);
            assert.equal(handled, false);
            cb();
          });
        });

        it('should not emit an onLoad event when view is created and `collection.options.onLoad` is `false', function(cb) {
          var emitted = false;
          var handled = false;
          var collection = app.collection();
          collection.options.onLoad = false;

          app.on('onLoad', function(view) {
            emitted = true;
          });

          app.onLoad('blog/:title', function(view, next) {
            handled = true;
            next();
          });

          collection.addView('whatever', {path: 'blog/foo.js', content: 'bar baz'});
          setImmediate(function() {
            assert.equal(typeof collection.views.whatever, 'object');
            assert.equal(emitted, false);
            assert.equal(handled, false);
            cb();
          });
        });

        it('should not emit an onLoad event when view is created and `view.options.onLoad` is `false', function(cb) {
          var emitted = false;
          var handled = false;
          var collection = app.collection();

          app.on('onLoad', function(view) {
            emitted = true;
          });

          app.onLoad('blog/:title', function(view, next) {
            handled = true;
            next();
          });

          collection.addView('whatever', {
            options: {
              onLoad: false
            },
            path: 'blog/foo.js',
            content: 'bar baz'
          });

          setImmediate(function() {
            assert.equal(typeof collection.views.whatever, 'object');
            assert.equal(emitted, false);
            assert.equal(handled, false);
            cb();
          });
        });
      });

      describe('view collections', function() {
        it('should emit a view event when view is created', function(cb) {
          app.create('posts');

          app.on('view', function(view) {
            assert.equal(view.path, 'blog/foo.js');
            cb();
          });

          app.onLoad('blog/:title', function(view, next) {
            assert.equal(view.path, 'blog/foo.js');
            next();
          });

          app.post('whatever', {path: 'blog/foo.js', content: 'bar baz'});
        });

        it('should emit an onLoad event when view is created', function(cb) {
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
  });
};
