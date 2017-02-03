'use strict';

var fs = require('fs');
var path = require('path');

function walk(cwd) {
  var dirs = fs.readdirSync(cwd);
  var len = dirs.length;
  var idx = -1;

  var res = { cwd: cwd };

  while (++idx < len) {
    var name = dirs[idx];
    if (name === '.git' || name === 'node_modules' || /^_/.test(name)) {
      continue;
    }

    var dir = path.resolve(cwd, name);
    var stat = fs.statSync(dir);
    if (stat.isDirectory()) {
      res[name] = fs.readdirSync(dir).reduce(function(acc, filename) {
        if (filename === '.git' || filename === 'node_modules' || /^_/.test(filename)) {
          return acc;
        }
        var fp = path.resolve(dir, filename);
        stat = fs.statSync(fp);
        if (stat.isDirectory()) {
          acc[filename] = fp;
        }
        return acc;
      }, {});
      res[name].cwd = dir;
    }
  }
  return res;
}

module.exports = walk;
