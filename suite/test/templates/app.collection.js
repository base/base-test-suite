'use strict';

var fs = require('fs');
var assert = require('assert');
var path = require('path');
var fixtures = path.resolve.bind(path, __dirname, 'fixtures');
var support = require('../../support');
var hasProperties = support.hasProperties;

module.exports = function(App, options, runner) {
  var app;

  var define = require('define-property');
  var Collection = App.Collection;

  describe('app.collection', function() {
    describe('method', function() {
      beforeEach(function() {
        app = new App();
      });

      it('should expose the collection method', function() {
        assert.equal(typeof app.collection, 'function');
      });

      it('should return a new collection', function() {
        var collection = app.collection();
        assert.equal(typeof collection, 'object');
      });

      it('should have isCollection property', function() {
        var collection = app.collection();
        assert.equal(collection.isCollection, true);
      });
    });

    describe('adding views', function() {
      beforeEach(function() {
        app = new App()
          .use(function() {
            return function() {
              define(this, 'count', {
                get: function() {
                  return Object.keys(this.views).length;
                },
                set: function() {
                  throw new Error('count is a read-only getter and cannot be defined.');
                }
              });
            };
          });

        app.engine('tmpl', require('engine-base'));
        app.create('pages');
      });

      it('should load a view onto the respective collection:', function() {
        app.pages(fixtures('pages/a.hbs'));
        assert(app.views.pages.hasOwnProperty(fixtures('pages/a.hbs')));
      });

      it('should allow collection methods to be chained:', function() {
        app
          .pages(fixtures('pages/a.hbs'))
          .pages(fixtures('pages/b.hbs'))
          .pages(fixtures('pages/c.hbs'));

        hasProperties(app.views.pages, [
          fixtures('pages/a.hbs'),
          fixtures('pages/b.hbs'),
          fixtures('pages/c.hbs')
        ]);
      });

      it('should expose the `option` method:', function() {
        app.pages.option('foo', 'bar')
          .pages(fixtures('pages/a.hbs'))
          .pages(fixtures('pages/b.hbs'))
          .pages(fixtures('pages/c.hbs'));

        assert(app.pages.options.hasOwnProperty('foo', 'bar'));
        hasProperties(app.views.pages, [
          fixtures('pages/a.hbs'),
          fixtures('pages/b.hbs'),
          fixtures('pages/c.hbs')
        ]);
      });

      it('should expose the `option` method:', function() {
        app.pages.option('foo', 'bar')
          .pages(fixtures('pages/a.hbs'))
          .pages(fixtures('pages/b.hbs'))
          .pages(fixtures('pages/c.hbs'));

        assert.equal(app.pages.count, 3);
      });
    });

    describe('addItem', function() {
      beforeEach(function() {
        app = new App();
      });

      it('should add items to a collection', function() {
        var pages = app.collection({Collection: Collection});
        pages.addItem('foo');
        pages.addItem('bar');
        pages.addItem('baz');

        pages.items.hasOwnProperty('foo');
        pages.items.hasOwnProperty('bar');
        pages.items.hasOwnProperty('baz');
      });

      it('should create a collection from an existing collection:', function() {
        var pages = app.collection({Collection: Collection});
        pages.addItem('foo');
        pages.addItem('bar');
        pages.addItem('baz');

        var posts = app.collection(pages);
        posts.items.hasOwnProperty('foo');
        posts.items.hasOwnProperty('bar');
        posts.items.hasOwnProperty('baz');
      });
    });

    describe('rendering views', function() {
      beforeEach(function() {
        app = new App();
        app.engine('tmpl', require('engine-base'));
        app.create('pages');
        app.cache.data = {};
      });

      it('should render a view with inherited app.render', function(cb) {
        app.page(fixtures('templates/a.tmpl'))
          .use(function(view) {
            view.contents = fs.readFileSync(view.path);
          })
          .set('data.name', 'Brian')
          .render(function(err, res) {
            if (err) return cb(err);
            assert.equal(res.content, 'Brian');
            cb();
          });
      });
    });
  });

  describe('collection singular method', function() {
    describe('create', function() {
      beforeEach(function() {
        app = new App();
      });

      it('should add a pluralized collection from singular name', function() {
        app.create('page');
        assert.equal(typeof app.views.pages, 'object');
      });
    });

    describe('adding views', function() {
      beforeEach(function() {
        app = new App();
        app.engine('tmpl', require('engine-base'));
        app.create('page');
      });

      it('should add a view to the created collection:', function() {
        app.page(fixtures('pages/a.hbs'));
        assert.equal(typeof app.views.pages[fixtures('pages/a.hbs')], 'object');
      });

      it('should expose the `option` method:', function() {
        app.pages.option('foo', 'bar');
        assert(app.pages.options.hasOwnProperty('foo', 'bar'));
      });
    });
  });
};
