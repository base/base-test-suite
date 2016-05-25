'use strict';

// this is from the vinyl/vinyl-fs tests, since we use vinyl extensively
var fs = require('graceful-fs');
var sinon = require('sinon');
var errorfn = false;

function maybeCallAsync(fsModule, methodname) {
  var original = fsModule[methodname];
  return sinon.stub(fsModule, methodname, function() {
    var args = [].slice.call(arguments);
    args.unshift(fsModule, methodname);
    var err = typeof errorfn === 'function' && errorfn.apply(this, args);
    if (!err) {
      original.apply(this, arguments);
    } else {
      arguments[arguments.length - 1](err);
    }
  });
}

module.exports = {
  setError: function(fn) {
    errorfn = fn;
  },
  chmodSpy: maybeCallAsync(fs, 'chmod'),
  fchmodSpy: maybeCallAsync(fs, 'fchmod'),
  futimesSpy: maybeCallAsync(fs, 'futimes'),
  statSpy: maybeCallAsync(fs, 'stat'),
  fstatSpy: maybeCallAsync(fs, 'fstat')
};
