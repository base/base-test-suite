'use strict';

var assert = require('assert');
var support = require('./support/');
assert.containEql = support.containEql;

module.exports = function(App, options, runner) {
  var List = App.List;
  var Group = App.Group;
  var Views = App.Views;
  var views;
  var group;
  var app;

  describe('group', function() {
    describe('constructor', function() {
      it('should create an instance of Group:', function() {
        var group = new Group();
        assert(group instanceof Group);
      });

      it('should instantiate without new', function() {
        var group = Group();
        assert(group instanceof Group);
      });

      it('should create an instance of Group with default List:', function() {
        var group = new Group();
        assert.deepEqual(group.List, List);
      });

      it.skip('should create an instance of Group with `views` and `listViews` properties:', function() {
        var group = new Group(new Views(), new Views());
        assert.equal(typeof group.views, 'object');
        assert.equal(typeof group.listViews, 'object');
      });
    });

    describe('static methods', function() {
      it('should expose `extend`:', function() {
        assert.equal(typeof Group.extend, 'function');
      });
    });

    describe('prototype methods', function() {
      beforeEach(function() {
        group = new Group();
      });

      it('should expose `use`', function() {
        assert.equal(typeof group.use, 'function');
      });
      it('should expose `set`', function() {
        assert.equal(typeof group.set, 'function');
      });
      it('should expose `get`', function() {
        assert.equal(typeof group.get, 'function');
      });
      it('should expose `visit`', function() {
        assert.equal(typeof group.visit, 'function');
      });
      it('should expose `define`', function() {
        assert.equal(typeof group.define, 'function');
      });
    });

    describe('instance', function() {
      beforeEach(function() {
        group = new Group();
      });

      it('should expose options:', function() {
        assert.equal(typeof group.options, 'object');
      });

      it('should set a value on the instance:', function() {
        group.set('a', 'b');
        assert.equal(group.a, 'b');
      });

      it('should get a value from the instance:', function() {
        group.set('a', 'b');
        assert.equal(group.get('a'), 'b');
      });
    });

    describe('option', function() {
      it('should set options on group.options', function() {
        var group = new Group();
        group.option('a', {b: {c: 'd'}});
        assert.equal(group.option('a.b.c'), 'd');
      });
    });

    describe('groupBy', function() {
      beforeEach(function() {
        views = new Views();
        views.addView('one.hbs', {data: {foo: 'foo', bar: 'bar'}});
        views.addView('two.hbs', {data: {foo: 'foo', bar: 'bar'}});
        views.addView('three.hbs', {data: {foo: 'foo', bar: 'bar'}});
      });

      it.skip('should group views from the provided `views` collection when using `.groupBy`', function() {
        var group = new Group(views);
        var actual = group.groupBy('data.foo', 'data.bar');
        assert.deepEqual(Object.keys(actual.foo), ['bar']);
      });
    });

    describe('use', function() {
      beforeEach(function() {
        group = new Group();
      });

      it('should use plugins on a group:', function() {
        group.set('one', {contents: new Buffer('aaa')});
        group.set('two', {contents: new Buffer('zzz')});

        group
          .use(function(group) {
            group.options = {};
          })
          .use(function(group) {
            group.options.foo = 'bar';
          })
          .use(function() {
            this.set('one', 'two');
          });

        assert.equal(group.one, 'two');
        assert.equal(group.options.foo, 'bar');
      });
    });
  });

};
