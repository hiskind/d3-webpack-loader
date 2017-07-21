var expect = require('chai').expect;
var path = require('path');
var fixtures = require('./fixtures/installFixtures');


function fixtureCompiler(fixtureName) {
  var fixtureRoot = path.join(__dirname, 'fixtures', 'build');
  var fixturePath = path.join(fixtureRoot, fixtureName);
  var configPath = path.join(fixturePath, 'webpack.config.js');
  var webpack = require(path.join(fixturePath, 'node_modules', 'webpack', 'lib', 'webpack.js'));
  var webpackConfig = require(configPath);
  var compiler = webpack(webpackConfig);

  return compiler;
}

describe('typical - works with require("d3!") with a couple d3 modules', function () {
  this.timeout(10000);
  fixtures.webpackVersions.forEach(function (webpackVersion) {
    it(webpackVersion, function (done) {
      var compiler = fixtureCompiler('default-module-directories-' + webpackVersion);

      compiler.run(function () {
        var compiledFile = path.join(
          compiler.options.output.path,
          compiler.options.output.filename
        );
        var d3Functions = require(compiledFile).default.d3Functions;

        // uses d3-array and d3-selection so check they have functions in there.
        expect(d3Functions).to.include('sum');
        expect(d3Functions).to.include('select');
        done();
      });
    });
  });
});

describe('does not fail when no d3 modules installed', function () {
  this.timeout(10000);
  fixtures.webpackVersions.forEach(function (webpackVersion) {
    it(webpackVersion, function (done) {
      var compiler = fixtureCompiler('no-d3-modules-' + webpackVersion);

      compiler.run(function () {
        var compiledFile = path.join(
          compiler.options.output.path,
          compiler.options.output.filename
        );
        var d3Functions = require(compiledFile).default.d3Functions;

        expect(d3Functions).to.be.empty;
        done();
      });
    });
  });
});

describe('looks in configured module directories', function () {
  this.timeout(10000);
  fixtures.webpackVersions.forEach(function (webpackVersion) {
    it(webpackVersion, function (done) {
      var compiler = fixtureCompiler('configured-module-directories-' + webpackVersion);

      compiler.run(function () {
        var compiledFile = path.join(
          compiler.options.output.path,
          compiler.options.output.filename
        );
        var d3Functions = require(compiledFile).default.d3Functions;

        // uses d3-array and d3-selection so check they have functions in there.
        expect(d3Functions).to.include('sum'); // from resolve.root
        expect(d3Functions).to.include('select'); // from resolve.moduleDirectories
        expect(d3Functions).to.include('nest'); // from resolve.fallbacks
        done();
      });
    });
  });
});
