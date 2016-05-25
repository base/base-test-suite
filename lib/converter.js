'use strict';

var condense = require('gulp-condense');
var through = require('through2');

/**
 * Modify variables and requires in mocha test files.
 * This is only used when we move test files from
 * a core lib to base-test-suite. it's hacky but it works
 *
 * ```sh
 * $ npm i -g base-app && base -f converter.js
 * ```
 */

module.exports = function(app, base) {
  app.task('default', function() {
    return app.src('*.js', {cwd: '_templates'})
      .pipe(updateTests())
      .pipe(condense())
      // .pipe(app.dest('templates'))
  });
};

function updateTests() {
  return through.obj(function(file, enc, next) {
    var str = file.contents.toString();
    file.contents = new Buffer(wrapCode(str));
    next(null, file);
  });
}

function wrapCode(str) {
  var fixtures = [];
  var hasProps = [];
  var move = [];


  var lines = str.split('\n').reduce(function(acc, line) {
    if (filter(line)) {
      return acc;
    }

    var newLine = hasProperties(line);
    if (newLine !== line) {
      hasProps = [
        `var support = require('../support');`,
        `var hasProperties = support.hasProperties;`
      ];
      line = newLine;
    }

    line = hasOwn(line);
    line = notHasOwn(line);
    line = assert(line);
    line = notAssert(line);
    line = assertEqual(line);
    line = assertNotEqual(line);
    line = assertStrictEqual(line);

    if (/assert/.test(line)) {
      if (move.indexOf('assert') === -1) {
        move.push('assert');
      }
    }

    if (match(line, 'assert')) {
      if (move.indexOf('assert') === -1) {
        move.push('assert');
      }
      return acc;
    }

    if (match(line, 'consolidate')) {
      if (move.indexOf('consolidate') === -1) {
        move.push('consolidate');
      }
      return acc;
    }
    if (match(line, 'fs')) {
      if (move.indexOf('fs') === -1) {
        move.push('fs');
      }
      return acc;
    }
    if (match(line, 'path')) {
      if (move.indexOf('path') === -1) {
        move.push('path');
      }
      return acc;
    }

    newLine = convertPath(line);
    if (newLine !== line) {
      if (move.indexOf('path') === -1) {
        move.push('path');
      }
      fixtures = ['var fixtures = path.resolve.bind(path, __dirname, \'fixtures\');'];
      line = newLine;
    }

    return acc.concat('  ' + line);
  }, []);

  var prefix = [
    '\'use strict\';',
    '',
    ...move.map(toRequire),
    ...fixtures,
    ...hasProps,
    '',
    'module.exports = function(App, options, runner) {',
    '  var app;',
    ''
  ];

  lines.push('};');
  var str = prefix.concat(lines).join('\n');
  return str.replace(/\n  \n};$/, '\n};') + '\n';
};

function match(line, name) {
  var re = new RegExp(`var ${name} = require\\('${name}'\\)`);
  if (re.test(line)) {
    return name;
  }
}

function toRequire(name) {
  return `var ${name} = require('${name}');`;
}

function filter(str) {
  if (/use strict/.test(str)) {
    return true;
  }
  if (/var app;/.test(str)) {
    return true;
  }
  if (/require\('(mocha|should)'\)/.test(str)) {
    return true;
  }
  if (/var support = require\('\.\/support'\)/.test(str)) {
    return true;
  }
  if (/support\.resolve\(/.test(str)) {
    return true;
  }
  return false;
}

function convertPath(line) {
  if (/<%/.test(line)) {
    return line;
  }
  var re = /(["'])(test\/fixtures\/)([^\1]+?)\1/g;
  return line.replace(re, function(_, $1, $2, $3) {
    return 'fixtures(\'' + $3 + '\')';
  });
}

function hasProperties(line) {
  if (!/should\.have\.properties/.test(line)) {
    return line;
  }
  var match = /^(\s+)(.*)/.exec(line);
  if (!match) return line;
  var lead = match[1];
  var rest = match[2];
  rest = rest.split('.should.have.properties(').join(', ');
  return lead + 'hasProperties(' + rest;
}

function doesNotHaveProperties(line) {
  if (!/\.should\.not\.have\.properties\(/.test(line)) {
    return line;
  }
  var match = /^(\s+)(.*)/.exec(line);
  if (!match) return line;
  var lead = match[1];
  var rest = match[2];
  rest = rest.split('.should.not.have.properties(').join(', ');
  return lead + 'doesNotHaveProperties(' + rest;
}

function assertEqual(str) {
  if (!/\.should\.equal/.test(str)) {
    return str;
  }
  var match = /^(\s+)(.*)/.exec(str);
  if (!match) return str;
  var lead = match[1];
  var rest = match[2];

  var asserted = 'assert.equal(' + rest.split('.should.equal(').join(', ');
  return lead + asserted;
}

function assertNotEqual(str) {
  if (!/\.should\.not\.equal/.test(str)) {
    return str;
  }
  var match = /^(\s+)(.*)/.exec(str);
  if (!match) return str;
  var lead = match[1];
  var rest = match[2];

  var asserted = 'assert.notEqual(' + rest.split('.should.not.equal(').join(', ');
  return lead + asserted;
}

function hasOwn(str) {
  if (!/should\.have\.property\('/.test(str)) {
    return str;
  }
  var match = /^(\s+)(.*)/.exec(str);
  if (!match) return str;
  var lead = match[1];
  var rest = match[2];

  var asserted = rest.split('should.have.property(\'').join('hasOwnProperty(\'');
  return lead + 'assert(' + asserted.replace(/;$/, ');');
}

function notHasOwn(str) {
  if (!/should\.not\.have\.property\('/.test(str)) {
    return str;
  }
  var match = /^(\s+)(.*)/.exec(str);
  if (!match) return str;
  var lead = match[1];
  var rest = match[2];

  var asserted = rest.split('should.not.have.property(\'').join('hasOwnProperty(\'');
  return lead + 'assert(!' + asserted.replace(/;$/, ');');
}

function assert(str) {
  if (!/should\.exist\(/.test(str)) {
    return str;
  }
  var match = /^(\s+)(.*)/.exec(str);
  if (!match) return str;
  var lead = match[1];
  var rest = match[2];

  var asserted = rest.split('should.exist(').join('assert(');
  return lead + asserted;
}

function notAssert(str) {
  if (!/should\.not\.exist\(/.test(str)) {
    return str;
  }
  var match = /^(\s+)(.*)/.exec(str);
  if (!match) return str;
  var lead = match[1];
  var rest = match[2];

  var asserted = rest.split('should.not.exist(').join('assert(!');
  return lead + asserted;
}

function assertStrictEqual(str) {
  if (!/\.should\.eql/.test(str)) {
    return str;
  }
  var match = /^(\s+)(.*)/.exec(str);
  if (!match) return str;
  var lead = match[1];
  var rest = match[2];

  var asserted = 'assert.deepEqual(' + rest.split('.should.eql(').join(', ');
  return lead + asserted;
}
