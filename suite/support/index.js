'use strict';

var assert = require('assert');

exports.hasProperties = function(obj, keys) {
  keys = Array.isArray(keys) ? keys : [keys];
  var len = keys.length;
  var idx = -1;
  while (++idx < len) {
    assert(obj.hasOwnProperty(keys[idx]));
  }
};

exports.doesNotHaveProperties = function(obj, keys) {
  keys = Array.isArray(keys) ? keys : [keys];
  var len = keys.length;
  var idx = -1;
  while (++idx < len) {
    assert(!obj.hasOwnProperty(keys[idx]));
  }
};
