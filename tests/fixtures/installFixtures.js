// From: https://github.com/reactjs/redux/blob/master/examples/buildAll.js
/**
 * Runs an ordered set of commands within each of the build directories.
 * In this case, npm installs in each of the test fixtures
 */

var fs = require('fs-extra');
var path = require('path');
var spawnSync = require('child_process').spawnSync;

var exampleDirs = fs.readdirSync(__dirname).filter(function (file) {
  return fs.statSync(path.join(__dirname, file)).isDirectory() && file !== 'build';
});

var webpackVersions = ['1.13.2', '2.7.0', '3.3.0'];

function runCmd(dir, cmdArg) {
  // declare opts in this scope to avoid https://github.com/joyent/node/issues/9158
  var opts = {
    cwd: dir,
    stdio: 'inherit'
  };
  var result = {};
  if (process.platform === 'win32') {
    result = spawnSync(cmdArg.cmd + '.cmd', cmdArg.args, opts);
  } else {
    result = spawnSync(cmdArg.cmd, cmdArg.args, opts);
  }
  if (result.status !== 0) {
    throw new Error('Building examples exited with non-zero');
  }
}

function npmInstall(dir) {
  var npmInstallCmd = { cmd: 'npm', args: ['install'] };
  runCmd(dir, npmInstallCmd);
}

function npmInstallWebpack(dir, version) {
  var cmdInstallWebpack = { cmd: 'npm', args: ['install', '--save', 'webpack@' + version] };
  runCmd(dir, cmdInstallWebpack);
}

function reinstallFixtures() {
  fs.emptyDirSync(path.join(__dirname, 'build'));
  exampleDirs.forEach(function (dir) {
    webpackVersions.forEach(function (webpackVersion) {
      var specificWebpackDir = path.join(__dirname, 'build', dir + '-' + webpackVersion);
      fs.copySync(
        path.join(__dirname, dir),
        path.join(specificWebpackDir)
      );
      npmInstall(specificWebpackDir);
      npmInstallWebpack(specificWebpackDir, webpackVersion);
    });
  });
}


module.exports = {
  webpackVersions: webpackVersions
};


if (!module.parent) {
  reinstallFixtures();
}
