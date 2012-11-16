var fs = require('fs');
var repo = require('../repo');
var hash = require('./hash');
var zlib = require('zlib');
var path = require('path');
var async = require('async');
var mkdirp = require('mkdirp');

function hashToPath(objectHash) {
  return path.join(repo.gitDirectory, 'objects', objectHash.substr(0, 2), objectHash.substr(2));
}

exports.read = function(objectHash, callback) {
  var objectPath = hashToPath(objectHash);
  async.waterfall([
    function(callback) {
      fs.readFile(objectPath, callback);
    },
    function(buffer, callback) {
      zlib.inflate(buffer, callback);
    }
  ], callback);
};

exports.write = function(buffer, callback) {
  var objectHash = hash(buffer);
  var objectPath = hashToPath(objectHash);
  async.auto({
    deflate: function(callback) {
      zlib.deflate(buffer, callback);
    },
    ensureFolder: function(callback) {
      mkdirp(path.dirname(objectPath), callback);
    },
    write: ['deflate', 'ensureFolder', function(callback, results) {
      fs.writeFile(objectPath, results.deflate, callback);
    }]
  }, function(error, results) {
    callback(error, objectHash);
  });
};