'use strict';

var assert = require('assert');

module.exports = function(App, options, runner) {
  var app;

  describe('app.route', function() {
    beforeEach(function() {
      app = new App();
    });

    describe('routes', function() {
      it('should create a route for the given path:', function(cb) {
        app = new App();
        app.create('posts');

        app.on('all', function(msg) {
          assert.equal(msg, 'cb');
          cb();
        });

        app.route('blog/:title')
          .all(function(view, next) {
            app.emit('all', 'cb');
            next();
          });

        app.post('whatever', {path: 'blog/foo.js', content: 'bar baz'});
      });

      it('should emit events when a route method is called:', function(cb) {
        app = new App();
        app.create('posts');

        app.on('onLoad', function(view) {
          assert.equal(view.path, 'blog/foo.js');
          cb();
        });

        app.param('title', function(view, next, title) {
          assert.equal(title, 'foo.js');
          next();
        });

        app.onLoad('blog/:title', function(view, next) {
          assert.equal(view.path, 'blog/foo.js');
          next();
        });

        app.post('whatever', {path: 'blog/foo.js', content: 'bar baz'});
      });

      it('should emit errors', function(cb) {
        app = new App();
        app.create('posts');

        app.on('error', function(err) {
          assert.equal(err.message, "'foo.js' == 'fo.js'");
          cb();
        });

        // wrong...
        app.param('title', function(view, next, title) {
          assert.equal(title, 'fo.js');
          next();
        });

        app.onLoad('/blog/:title', function(view, next) {
          assert.equal(view.path, '/blog/foo.js');
          next();
        });

        app.post('whatever', {path: '/blog/foo.js', content: 'bar baz'});
      });

      it('should have path property', function() {
        var route = new app.Route('/blog/:year/:month/:day/:slug').all([
          function() {}
        ]);
        assert.equal(route.path, '/blog/:year/:month/:day/:slug');
      });

      it('should have stack property', function() {
        var route = new app.Route('/blog/:year/:month/:day/:slug').all([
          function() {}
        ]);

        assert(Array.isArray(route.stack), 'should be an array');
        assert.equal(route.stack.length, 1);
      });
    });
  });
};
