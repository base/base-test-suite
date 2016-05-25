'use strict';

var assert = require('assert');

module.exports = function(App, options, runner) {
  var app;

  describe('app.views', function() {
    beforeEach(function() {
      app = new App();
      app.engine('tmpl', require('engine-base'));
      app.create('partials', {viewType: 'partial'});
      app.create('pages');
    });

    it('should add a view to a collection', function() {
      app.partial('foo', {content: 'bar'});
      assert(app.views.partials.foo);
    });

    it('should create a helper for a view collection', function() {
      app.page('abc', {content: 'xyz'});
      assert(app.views.pages.abc);
      assert(app._.helpers.async.page);
    });
  });

};
