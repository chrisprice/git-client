var fs = require('fs');
var repo = require('../repo');
var hash = require('./hash-utils');
var zlib = require('zlib');
var path = require('path');
var async = require('async');
var mkdirp = require('mkdirp');

function hashToPath(objectHash) {
  return path.join(repo.gitDirectory, 'objects', objectHash.toString().substr(0, 2), objectHash.toString().substr(2));
}

exports.read = function(objectHash, callback) {
  var objectPath = hashToPath(hash(objectHash));
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
  var objectHash = hash.generate(buffer);
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