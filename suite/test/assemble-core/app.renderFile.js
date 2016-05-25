'use strict';

var assert = require('assert');
var path = require('path');

module.exports = function(App, options, runner) {
  var app;

  describe('app.renderFile', function() {
    beforeEach(function() {
      app = new App();
      app.engine('hbs', require('engine-handlebars'));
      app.engine('*', require('engine-base'));

      app.create('files', {engine: '*'});
      app.file('a', {content: 'this is <%= title() %>'});
      app.file('b', {content: 'this is <%= title() %>'});
      app.file('c', {content: 'this is <%= title() %>'});

      app.option('renameKey', function(key) {
        return path.basename(key, path.extname(key));
      });

      app.helper('title', function() {
        var view = this.context.view;
        var key = view.key;
        var ctx = this.context[key];
        if (ctx && ctx.title) return ctx.title;
        return key;
      });
    });

    it('should render views from src', function(cb) {
      var stream = app.src(path.join(__dirname, 'fixtures/pages/*.hbs'));
      var files = [];

      stream.pipe(app.renderFile())
        .on('error', cb)
        .on('data', function(file) {
          files.push(file);
        })
        .on('end', function() {
          assert.equal(files[0].basename, 'a.hbs');
          assert.equal(files[1].basename, 'b.hbs');
          assert.equal(files[2].basename, 'c.hbs');
          cb();
        });
    });

    it('should render views with the engine that matches the file extension', function(cb) {
      var stream = app.src(path.join(__dirname, 'fixtures/pages/*.hbs'));
      var files = [];

      stream.pipe(app.renderFile())
        .on('error', cb)
        .on('data', function(file) {
          files.push(file);
        })
        .on('end', function() {
          assert(/<h1>a<\/h1>/.test(files[0].contents.toString()));
          assert(/<h1>b<\/h1>/.test(files[1].contents.toString()));
          assert(/<h1>c<\/h1>/.test(files[2].contents.toString()));
          cb();
        });
    });

    it('should render views from src with the engine passed on the opts', function(cb) {
      var stream = app.src(path.join(__dirname, 'fixtures/pages/*.hbs'));
      var files = [];

      stream.pipe(app.renderFile({engine: '*'}))
        .on('error', cb)
        .on('data', function(file) {
          files.push(file);
        })
        .on('end', function() {
          assert(/<h2>a<\/h2>/.test(files[0].contents.toString()));
          assert(/<h2>b<\/h2>/.test(files[1].contents.toString()));
          assert(/<h2>c<\/h2>/.test(files[2].contents.toString()));
          cb();
        });
    });

    it('should use the context passed on the opts', function(cb) {
      var stream = app.src(path.join(__dirname, 'fixtures/pages/*.hbs'));
      var files = [];

      stream.pipe(app.renderFile({a: {title: 'foo'}}))
        .on('error', cb)
        .on('data', function(file) {
          files.push(file);
        })
        .on('end', function() {
          assert(/<h1>foo<\/h1>/.test(files[0].contents.toString()));
          assert(/<h1>b<\/h1>/.test(files[1].contents.toString()));
          assert(/<h1>c<\/h1>/.test(files[2].contents.toString()));
          cb();
        });
    });

    it('should render the files in a collection', function(cb) {
      var files = [];
      app.toStream('files')
        .pipe(app.renderFile())
        .on('error', cb)
        .on('data', function(file) {
          assert(file);
          assert(file.path);
          assert(file.contents);
          files.push(file);
        })
        .on('end', function() {
          assert(/this is a/.test(files[0].contents.toString()));
          assert(/this is b/.test(files[1].contents.toString()));
          assert(/this is c/.test(files[2].contents.toString()));
          assert.equal(files.length, 3);
          cb();
        });
    });

    it('should handle engine errors', function(cb) {
      app.create('notdefined', {engine: '*'});
      app.notdefined('foo', {content: '<%= bar %>'});
      app.toStream('notdefined')
        .pipe(app.renderFile())
        .on('error', function(err) {
          assert.equal(typeof err, 'object');
          assert.equal(err.message, 'bar is not defined');
          cb();
        })
        .on('end', function() {
          cb(new Error('expected renderFile to handle the error.'));
        });
    });
  });
};
