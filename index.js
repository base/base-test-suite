'use strict';

var path = require('path');
var lookup = require('./lib/lookup');
var dir = path.resolve(__dirname, 'suite');

module.exports = lookup(dir);
