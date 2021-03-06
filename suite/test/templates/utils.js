'use strict';

var assert = require('assert');

module.exports = function(App, options, runner) {
  var utils = App.utils;
  var app;

  describe('utils', function() {
    describe('bindAll', function() {
      it('should bind a context to fns passed on an object:', function() {
        var ctx = {app: {views: {}}, context: {a: 'b'}};
        var helpers = utils.bindAll({
          foo: function() {
            return this.context;
          },
          bar: function() {},
          baz: function() {}
        }, ctx);

        assert.deepEqual(helpers.foo(), {a: 'b'});
      });

      it('should bind a context to fns passed on an object of objects:', function() {
        var ctx = {app: {views: {}}, context: {a: 'b'}};
        var helpers = utils.bindAll({
          whatever: {
            foo: function() {
              return this.context;
            },
            bar: function() {},
            baz: function() {}
          }
        }, ctx);

        assert.deepEqual(helpers.whatever.foo(), {a: 'b'});
      });

      it('should bind a context to fns passed on an object of objects:', function() {
        var ctx = {app: {views: {}}, context: {a: 'b'}};
        var obj = {
          whatever: {
            foo: function() {
              return this.context;
            },
            bar: function() {},
            baz: function() {}
          }
        };
        obj.whatever.foo.async = true;
        var helpers = utils.bindAll(obj, ctx);
        assert(helpers.whatever.foo.async);
      });
    });

    describe('formatExt', function() {
      it('should ensure that file extension is preceded by a dot:', function() {
        assert.equal(utils.formatExt('.js'), '.js');
        assert.equal(utils.formatExt('js'), '.js');
      });

      it('should throw an error when not a string:', function(cb) {
        try {
          utils.formatExt();
          cb(new Error('expected an error'));
        } catch (err) {
          assert.equal(err.message, 'utils.formatExt() expects `ext` to be a string.');
          cb();
        }
      });
    });

    describe('getLocals', function() {
      it('should get locals from an object:', function() {
        var a = {foo: 'bar', hash: {one: 'two'}};
        var b = {baz: 'qux', hash: {three: 'four'}};

        assert.deepEqual(utils.getLocals(a, b), {
          three: 'four',
          one: 'two',
          baz: 'qux',
          foo: 'bar'
        });
      });

      it('should no blow up when first arg is null:', function() {
        var b = {baz: 'qux', hash: {three: 'four'}};

        assert.deepEqual(utils.getLocals(null, b), {
          three: 'four',
          baz: 'qux'
        });
      });

      it('should no blow up when second arg is null:', function() {
        var a = {foo: 'bar', hash: {one: 'two'}};

        assert.deepEqual(utils.getLocals(a, null), {
          one: 'two',
          foo: 'bar'
        });
      });
    });

    describe('isView', function() {
      it('should return true if a value looks like a view:', function() {
        assert(utils.isView({a: 'b', c: 'd', contents: '...'}));
        assert(utils.isView({a: 'b', c: 'd', content: '...'}));
        assert(utils.isView({a: 'b', c: 'd', path: '...'}));
      });

      it('should return false if a value is not a view:', function() {
        assert(!utils.isView({a: 'b', c: 'd'}));
        assert(!utils.isView('foo'));
      });
    });
  });

};
