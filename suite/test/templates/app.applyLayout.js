'use strict';

var assert = require('assert');

module.exports = function(App, options, runner) {
  var app;

  var page = {
    content: '<%= name %>',
    layout: 'default.tmpl',
    locals: {
      name: 'Halle'
    }
  };

  describe('app.applyLayout', function() {
    describe('rendering', function() {
      beforeEach(function() {
        app = new App();
        app.engine('tmpl', require('engine-base'));
        app.create('layout', { viewType: 'layout' });
        app.create('page');
      });

      it('should throw an error when a layout cannot be found:', function(cb) {
        app.layout('fofof.tmpl', {content: '..'});
        app.page('a.tmpl', page)
          .render(function(err) {
            assert(/layouts/.test(err.message));
            cb();
          });
      });

      it('should emit an error when a layout cannot be found:', function(cb) {
        app.layout('fofof.tmpl', {content: '..'});
        var count = 0;
        app.on('error', function(err) {
          assert(/layouts/.test(err.message));
          count++;
        });

        app.page('a.tmpl', page)
          .render(function() {
            assert.equal(count, 1);
            cb();
          });
      });

      it('should throw an error - layout defined but no layouts registered:', function(cb) {
        app.page('a.tmpl', page)
          .render(function(err) {
            assert(/layouts/.test(err.message));
            cb();
          });
      });

      it('should emit an error - layout defined but no layouts registered:', function(cb) {
        var count = 0;
        app.on('error', function(err) {
          assert(/layouts/.test(err.message));
          count++;
        });

        app.page('a.tmpl', page)
          .render(function() {
            assert.equal(count, 1);
            cb();
          });
      });

      it('should wrap a view with a layout (view.render):', function(cb) {
        app.layout('default.tmpl', {content: 'before {% body %} after'});
        app.page('a.tmpl', page)
          .render(function(err) {
            if (err) return cb(err);
            cb();
          });
      });

      it('should wrap a view with a layout (app.render):', function(cb) {
        app.layout('default.tmpl', {content: 'before {% body %} after'});
        app.page('a.tmpl', page);

        var view = app.pages.getView('a.tmpl');
        app.render(view, function(err, res) {
          if (err) return cb(err);
          assert.equal(res.contents.toString(), 'before Halle after');
          cb();
        });
      });
    });
  });

};
