'use strict';

var path = require('path');
var walk = require('./lib/walk');
var dir = path.resolve(__dirname, 'suite');

module.exports = walk(dir);
