'use strict';

module.exports = function replacer(regex, str, fn) {
  if (!regex.test(str)) {
    return str;
  }
  var match = /^(\s+)(.*)/.exec(str);
  if (!match) return str;
  var lead = match[1];
  var line = match[2];
  return lead + fn(line);
};
