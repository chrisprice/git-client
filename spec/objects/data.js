var wrench = require('wrench'),
    path = require('path'),
    repo = require('../../lib/repo');

module.exports = function() {
  var sampleGitDirectory = path.resolve(path.join(__dirname, 'data'));
  repo.gitDirectory = path.resolve(path.join(__dirname, 'temp'));

  beforeEach(function() {
    wrench.copyDirSyncRecursive(sampleGitDirectory, repo.gitDirectory);
  });

  afterEach(function() {
    wrench.rmdirSyncRecursive(repo.gitDirectory);
  });
};