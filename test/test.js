'use strict';

var opts = {alias: {pattern: 'p'}};
var argv = require('yargs-parser')(process.argv.slice(2), opts);
var assemble = require('assemble-core');
var templates = require('templates');
var runner = require('base-test-runner')(argv);
var suite = require('..');

/**
 * Run the tests in `base-test-suite`
 */

runner.on('assemble-core', function(file) {
  require(file.path)(assemble);
});

runner.on('templates', function(file) {
  require(file.path)(templates);
  require(file.path)(assemble);
});

runner.addFiles('templates', suite.test.templates);
runner.addFiles('assemble-core', suite.test['assemble-core']);
