'use strict';

var fs = require('graceful-fs');
var path = require('path');
var assert = require('assert');
var rimraf = require('rimraf');
var bufEqual = require('buffer-equal');
var through = require('through2');
var File = require('vinyl');

module.exports = function(App, options, runner) {
  var spies = require('./support/spy');
  var chmodSpy = spies.chmodSpy;
  var statSpy = spies.statSpy;
  var app, bufferStream;

  var wipeOut = function(cb) {
    rimraf(path.join(__dirname, 'actual/'), cb);
    spies.setError('false');
    statSpy.reset();
    chmodSpy.reset();
    app = new App();
  };

  var dataWrap = function(fn) {
    return function(data, enc, cb) {
      fn(data);
      cb();
    };
  };

  var realMode = function(n) {
    return n & parseInt('777', 8);
  };

  describe('app.symlink', function() {
    beforeEach(wipeOut);
    afterEach(wipeOut);

    it('should pass through writes with cwd', function(cb) {
      var inputPath = path.join(__dirname, 'fixtures/test.coffee');

      var expectedFile = new File({
        base: __dirname,
        cwd: __dirname,
        path: inputPath,
        contents: null
      });

      var onEnd = function() {
        assert.equal(buffered.length, 1);
        assert.equal(buffered[0], expectedFile);
        cb();
      };

      var stream = app.symlink('actual/', {cwd: __dirname});

      var buffered = [];
      bufferStream = through.obj(dataWrap(buffered.push.bind(buffered)), onEnd);
      stream.pipe(bufferStream);
      stream.write(expectedFile);
      stream.end();
    });

    it('should pass through writes with default cwd', function(cb) {
      var inputPath = path.join(__dirname, 'fixtures/test.coffee');

      var expectedFile = new File({
        base: __dirname,
        cwd: __dirname,
        path: inputPath,
        contents: null
      });

      var onEnd = function() {
        assert.equal(buffered.length, 1);
        assert.equal(buffered[0], expectedFile);
        cb();
      };

      var stream = app.symlink(path.join(__dirname, 'actual/'));

      var buffered = [];
      bufferStream = through.obj(dataWrap(buffered.push.bind(buffered)), onEnd);
      stream.pipe(bufferStream);
      stream.write(expectedFile);
      stream.end();
    });

    it('should make link to the correct folder with relative cwd', function(cb) {
      var inputPath = path.join(__dirname, 'fixtures/vinyl/test.coffee');
      var inputBase = path.join(__dirname, 'fixtures/vinyl/');
      var expectedPath = path.join(__dirname, 'actual/test.coffee');
      var expectedBase = path.join(__dirname, 'actual');
      var expectedContents = fs.readFileSync(inputPath);

      var expectedFile = new File({
        base: inputBase,
        cwd: __dirname,
        path: inputPath,
        contents: expectedContents
      });

      var onEnd = function() {
        assert.equal(buffered.length, 1);
        assert.equal(buffered[0], expectedFile);
        assert.equal(buffered[0].cwd, __dirname, 'cwd should have changed');
        assert.equal(buffered[0].base, expectedBase, 'base should have changed');
        assert.equal(buffered[0].path, expectedPath, 'path should have changed');
        assert.equal(fs.existsSync(expectedPath), true);
        assert.equal(bufEqual(fs.readFileSync(expectedPath), expectedContents), true);
        assert.equal(fs.readlinkSync(expectedPath), inputPath);
        cb();
      };

      var stream = app.symlink('actual/', {cwd: path.relative(process.cwd(), __dirname)});

      var buffered = [];
      bufferStream = through.obj(dataWrap(buffered.push.bind(buffered)), onEnd);
      stream.pipe(bufferStream);
      stream.write(expectedFile);
      stream.end();
    });

    it('should write buffer files to the correct folder with function and relative cwd', function(cb) {
      var inputPath = path.join(__dirname, 'fixtures/vinyl/test.coffee');
      var inputBase = path.join(__dirname, 'fixtures/vinyl/');
      var expectedPath = path.join(__dirname, 'actual/test.coffee');
      var expectedBase = path.join(__dirname, 'actual');
      var expectedContents = fs.readFileSync(inputPath);

      var expectedFile = new File({
        base: inputBase,
        cwd: __dirname,
        path: inputPath,
        contents: expectedContents
      });

      var onEnd = function() {
        assert.equal(buffered.length, 1);
        assert.equal(buffered[0], expectedFile);
        assert.equal(buffered[0].cwd, __dirname, 'cwd should have changed');
        assert.equal(buffered[0].base, expectedBase, 'base should have changed');
        assert.equal(buffered[0].path, expectedPath, 'path should have changed');
        assert.equal(fs.existsSync(expectedPath), true);
        assert.equal(bufEqual(fs.readFileSync(expectedPath), expectedContents), true);
        assert.equal(fs.readlinkSync(expectedPath), inputPath);
        cb();
      };

      var stream = app.symlink(function(file) {
        assert(file);
        assert.equal(file, expectedFile);
        return 'actual';
      }, {cwd: path.relative(process.cwd(), __dirname)});

      var buffered = [];
      bufferStream = through.obj(dataWrap(buffered.push.bind(buffered)), onEnd);
      stream.pipe(bufferStream);
      stream.write(expectedFile);
      stream.end();
    });

    it('should write buffer files to the correct folder', function(cb) {
      var inputPath = path.join(__dirname, 'fixtures/vinyl/test.coffee');
      var inputBase = path.join(__dirname, 'fixtures/vinyl/');
      var expectedPath = path.join(__dirname, 'actual/test.coffee');
      var expectedContents = fs.readFileSync(inputPath);
      var expectedBase = path.join(__dirname, 'actual');
      var expectedMode = parseInt('655', 8);

      var expectedFile = new File({
        base: inputBase,
        cwd: __dirname,
        path: inputPath,
        contents: expectedContents,
        stat: {
          mode: expectedMode
        }
      });

      var onEnd = function() {
        assert.equal(buffered.length, 1);
        assert.equal(buffered[0], expectedFile);
        assert.equal(buffered[0].cwd, __dirname, 'cwd should have changed');
        assert.equal(buffered[0].base, expectedBase, 'base should have changed');
        assert.equal(buffered[0].path, expectedPath, 'path should have changed');
        assert.equal(fs.existsSync(expectedPath), true);
        assert.equal(bufEqual(fs.readFileSync(expectedPath), expectedContents), true);
        assert.equal(fs.readlinkSync(expectedPath), inputPath);
        cb();
      };

      var stream = app.symlink('actual/', {cwd: __dirname});

      var buffered = [];
      bufferStream = through.obj(dataWrap(buffered.push.bind(buffered)), onEnd);
      stream.pipe(bufferStream);
      stream.write(expectedFile);
      stream.end();
    });

    it('should write streaming files to the correct folder', function(cb) {
      var inputPath = path.join(__dirname, 'fixtures/vinyl/test.coffee');
      var inputBase = path.join(__dirname, 'fixtures/vinyl/');
      var expectedPath = path.join(__dirname, 'actual/test.coffee');
      var expectedContents = fs.readFileSync(inputPath);
      var expectedBase = path.join(__dirname, 'actual');
      var expectedMode = parseInt('655', 8);

      var contentStream = through.obj();
      var expectedFile = new File({
        base: inputBase,
        cwd: __dirname,
        path: inputPath,
        contents: contentStream,
        stat: {
          mode: expectedMode
        }
      });

      var onEnd = function() {
        assert.equal(buffered.length, 1);
        assert.equal(buffered[0], expectedFile);
        assert.equal(buffered[0].cwd, __dirname, 'cwd should have changed');
        assert.equal(buffered[0].base, expectedBase, 'base should have changed');
        assert.equal(buffered[0].path, expectedPath, 'path should have changed');
        assert.equal(fs.existsSync(expectedPath), true);
        assert.equal(bufEqual(fs.readFileSync(expectedPath), expectedContents), true);
        assert.equal(fs.readlinkSync(expectedPath), inputPath);
        cb();
      };

      var stream = app.symlink('actual/', {cwd: __dirname});

      var buffered = [];
      bufferStream = through.obj(dataWrap(buffered.push.bind(buffered)), onEnd);
      stream.pipe(bufferStream);
      stream.write(expectedFile);
      setImmediate(function() {
        contentStream.write(expectedContents);
        contentStream.end();
      });
      stream.end();
    });

    it('should write directories to the correct folder', function(cb) {
      var inputPath = path.join(__dirname, 'fixtures/vinyl/wow');
      var inputBase = path.join(__dirname, 'fixtures/vinyl/');
      var expectedPath = path.join(__dirname, 'actual/wow');
      var expectedBase = path.join(__dirname, 'actual');
      var expectedMode = parseInt('655', 8);

      var expectedFile = new File({
        base: inputBase,
        cwd: __dirname,
        path: inputPath,
        contents: null,
        stat: {
          isDirectory: function() {
            return true;
          },
          mode: expectedMode
        }
      });

      var onEnd = function() {
        assert.equal(buffered.length, 1);
        assert.equal(buffered[0], expectedFile);
        assert.equal(buffered[0].cwd, __dirname, 'cwd should have changed');
        assert.equal(buffered[0].base, expectedBase, 'base should have changed');
        assert.equal(buffered[0].path, expectedPath, 'path should have changed');
        assert.equal(fs.readlinkSync(expectedPath), inputPath);
        assert.equal(fs.lstatSync(expectedPath).isDirectory(), false);
        assert.equal(fs.statSync(expectedPath).isDirectory(), true);
        cb();
      };

      var stream = app.symlink('actual/', {cwd: __dirname});

      var buffered = [];
      bufferStream = through.obj(dataWrap(buffered.push.bind(buffered)), onEnd);
      stream.pipe(bufferStream);
      stream.write(expectedFile);
      stream.end();
    });

    it('should use different modes for files and directories', function(cb) {
      var inputBase = path.join(__dirname, 'fixtures/vinyl');
      var inputPath = path.join(__dirname, 'fixtures/vinyl/wow/suchempty');
      var expectedBase = path.join(__dirname, 'actual/wow');
      var expectedDirMode = parseInt('755', 8);
      var expectedFileMode = parseInt('655', 8);

      var firstFile = new File({
        base: inputBase,
        cwd: __dirname,
        path: inputPath,
        stat: fs.statSync(inputPath)
      });

      var onEnd = function() {
        assert.equal(realMode(fs.lstatSync(expectedBase).mode), expectedDirMode);
        assert.equal(realMode(buffered[0].stat.mode), expectedFileMode);
        cb();
      };

      var stream = app.symlink('actual/', {
        cwd: __dirname,
        mode: expectedFileMode,
        dirMode: expectedDirMode
      });

      var buffered = [];
      bufferStream = through.obj(dataWrap(buffered.push.bind(buffered)), onEnd);

      stream.pipe(bufferStream);
      stream.write(firstFile);
      stream.end();
    });

    it('should change to the specified base', function(cb) {
      var inputBase = path.join(__dirname, 'fixtures/vinyl');
      var inputPath = path.join(__dirname, 'fixtures/vinyl/wow/suchempty');

      var firstFile = new File({
        base: inputBase,
        cwd: __dirname,
        path: inputPath,
        stat: fs.statSync(inputPath)
      });

      var onEnd = function() {
        assert.equal(buffered[0].base, inputBase);
        cb();
      };

      var stream = app.symlink('actual/', {
        cwd: __dirname,
        base: inputBase
      });

      var buffered = [];
      bufferStream = through.obj(dataWrap(buffered.push.bind(buffered)), onEnd);

      stream.pipe(bufferStream);
      stream.write(firstFile);
      stream.end();
    });

    it('should report IO errors', function(cb) {
      var inputPath = path.join(__dirname, 'fixtures/vinyl/test.coffee');
      var inputBase = path.join(__dirname, 'fixtures/vinyl/');
      var expectedContents = fs.readFileSync(inputPath);
      var expectedBase = path.join(__dirname, 'actual');
      var expectedMode = parseInt('722', 8);

      var expectedFile = new File({
        base: inputBase,
        cwd: __dirname,
        path: inputPath,
        contents: expectedContents,
        stat: {
          mode: expectedMode
        }
      });

      fs.mkdirSync(expectedBase);
      fs.chmodSync(expectedBase, 0);

      var stream = app.symlink('actual/', {cwd: __dirname});
      stream.on('error', function(err) {
        assert.equal(err.code, 'EACCES');
        cb();
      });
      stream.write(expectedFile);
    });

    ['end', 'finish'].forEach(function(eventName) {
      it('should emit ' + eventName + ' event', function(cb) {
        var srcPath = path.join(__dirname, 'fixtures/test.coffee');
        var stream = app.symlink('actual/', {cwd: __dirname});

        stream.on(eventName, function() {
          cb();
        });

        var file = new File({
          path: srcPath,
          cwd: __dirname,
          contents: new Buffer('1234567890')
        });

        stream.write(file);
        stream.end();
      });
    });
  });
};
