var fs = require('fs');
var hash = require('./hash');
var zlib = require('zlib');
var path = require('path');
var async = require('async');
var mkdirp = require('mkdirp');

function hashToPath(objectHash) {
  return path.join('.', '.git', 'objects', objectHash.substr(0, 2), objectHash.substr(2));
}

exports.read = function(objectHash) {
  var objectPath = hashToPath(objectHash);
  async.waterfall([
    function(callback) {
      fs.readFile(callback, objectPath);
    },
    function(callback, buffer) {
      zlib.inflate(callback, buffer);
    }
  ], callback);
};

exports.write = function(buffer, callback) {
  var objectHash = hash(buffer);
  var objectPath = hashToPath(objectHash);
  async.auto({
    deflate: function(callback) {
      zlib.deflate(callback, buffer);
    },
    ensureFolder: function(callback) {
      mkdirp(path.dirname(objectPath), callback);
    },
    write: ['deflate', 'ensureFolder', function(callback, results) {
      fs.writeFile(callback, results.deflate);
    }],
    returnHash: ['write', function(callback) {
      callback(null, objectHash);
    }]
  }, callback);
};