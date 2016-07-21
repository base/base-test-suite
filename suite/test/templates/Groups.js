'use strict';

var assert = require('assert');
var support = require('./support/');
assert.containEql = support.containEql;

module.exports = function(App, options, runner) {
  var List = App.List;
  var Groups = App.Groups;
  var Views = App.Views;
  var views;
  var groups;
  var app;

  describe.skip('groups', function() {
    describe('constructor', function() {
      it('should create an instance of Groups:', function() {
        var groups = new Groups();
        assert(groups instanceof Groups);
      });

      it('should instantiate without new', function() {
        var groups = Groups();
        assert(groups instanceof Groups);
      });

      it('should create an instance of Groups with default List:', function() {
        var groups = new Groups();
        assert.deepEqual(groups.List, List);
      });
    });

    describe('static methods', function() {
      it('should expose `extend`:', function() {
        assert.equal(typeof Groups.extend, 'function');
      });
    });

    describe('prototype methods', function() {
      beforeEach(function() {
        groups = new Groups();
      });

      it('should expose `use`', function() {
        assert.equal(typeof groups.use, 'function');
      });
      it('should expose `set`', function() {
        assert.equal(typeof groups.set, 'function');
      });
      it('should expose `get`', function() {
        assert.equal(typeof groups.get, 'function');
      });
      it('should expose `visit`', function() {
        assert.equal(typeof groups.visit, 'function');
      });
      it('should expose `define`', function() {
        assert.equal(typeof groups.define, 'function');
      });
    });

    describe('instance', function() {
      beforeEach(function() {
        groups = new Groups();
      });

      it('should expose options:', function() {
        assert.equal(typeof groups.options, 'object');
      });

      it('should set a value on the `groups` object:', function() {
        groups.set('a', 'b');
        assert.equal(groups.groups.a, 'b');
      });

      it('should get a value from the `groups` object:', function() {
        groups.set('a', 'b');
        assert.equal(groups.get('a'), 'b');
      });
    });

    describe('option', function() {
      it('should set options on groups.options', function() {
        var groups = new Groups();
        groups.option('a', {b: {c: 'd'}});
        assert.equal(groups.option('a.b.c'), 'd');
      });
    });

    describe('get', function() {
      beforeEach(function() {
        views = new Views();
        views.addView('one.hbs', {data: {foo: 'foo', bar: 'bar'}});
        views.addView('two.hbs', {data: {foo: 'foo', bar: 'bar'}});
        views.addView('three.hbs', {data: {foo: 'foo', bar: 'bar'}});
      });

      it('should get a Groups object when not an array', function() {
        var groups = new Groups(views.groupBy('data.foo', 'data.bar'));
        var actual = groups.get('foo').keys;
        assert.deepEqual(actual, ['bar']);
      });

      it('should get an instance of List when value is an array', function() {
        var groups = new Groups(views.groupBy('data.foo'));
        var list = groups.get('foo');
        assert(list instanceof List);
        assert.deepEqual(list.items.length, 3);
      });

      it('should throw an error when trying to use a List method on a non List value', function(cb) {
        try {
          var groups = new Groups(views.groupBy('data.foo', 'data.bar'));
          var foo = groups.get('foo');
          foo.paginate();
          cb(new Error('expected an error'));
        } catch (err) {
          assert.equal(err.message, 'paginate can only be used with an array of `List` items.');
          cb();
        }
      });
    });

    describe('use', function() {
      beforeEach(function() {
        groups = new Groups();
      });

      it('should use plugins on a groups:', function() {
        groups.set('one', {contents: new Buffer('aaa')});
        groups.set('two', {contents: new Buffer('zzz')});

        groups
          .use(function(groups) {
            groups.options = {};
          })
          .use(function(groups) {
            groups.options.foo = 'bar';
          })
          .use(function() {
            this.set('one', 'two');
          });

        assert.equal(groups.groups.one, 'two');
        assert.equal(groups.options.foo, 'bar');
      });
    });
  });

};
