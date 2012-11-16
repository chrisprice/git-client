var fs = require('../../lib/objects/fs'),
    path = require('path'),
    repo = require('../../lib/repo'),
    wrench = require('wrench');

var sampleGitDirectory = path.resolve(path.join(__dirname, 'data'));
repo.gitDirectory = path.resolve(path.join(__dirname, 'temp'));

describe('Reading/writing an object to a file', function() {
  beforeEach(function() {
    wrench.copyDirSyncRecursive(sampleGitDirectory, repo.gitDirectory);
  });

  afterEach(function() {
    wrench.rmdirSyncRecursive(repo.gitDirectory);
  });

  it('Should write a buffer successfully', function(done) {
    fs.write(new Buffer("blob 16\000what is up, doc?"), function(error, hash) {
      expect(error).toBeNull();
      expect(hash).toBe("bd9dbf5aae1a3862dd1526723246b20206e5fc37");
      done();
    });
  });

  it('Should read to a buffer successfully', function(done) {
    fs.read("bd9dbf5aae1a3862dd1526723246b20206e5fc37", function(error, buffer) {
      expect(error).toBeNull();
      expect(buffer.toString()).toBe("blob 16\000what is up, doc?");
      done();
    });
  });

});





