var fs = require('fs');
var repo = require('../repo');
var hash = require('./hash');
var path = require('path');
var async = require('async');
var mkdirp = require('mkdirp');

function readHash(buffer, offset) {
  var hash = "";
  for (var i = 0; i < 5; i++) {
    hash +=  buffer.readUInt32BE(buffer + i * 4).toString(16);
  }
  return hash;
}

function findPackName(callback) {
  fs.readdir(path.join(repo.gitDirectory, 'objects', 'pack'), function(error, files) {
    if (error) {
      callback(error);
    }
    var packNames = files.map(function (file) {
      return path.basename(file, path.extname(file));
    }).sort().filter(function(item, index, array) {
      return array[index] != array[index - 1];
    });
    callback(null, packNames[0]);
  });
}

function readFanOutTableValue(buffer, index) {
  return buffer.readUInt32BE(8 + index * 4);
}

function readFanOutTable(buffer, objectHash) {
  var index = parseInt(objectHash.substr(0, 2), 16);
  var offset = readFanOutTableValue(buffer, index);
  return {
    offset: offset,
    length: readFanOutTableValue(buffer, index + 1) - offset
  };
}

function findHashTableIndex(buffer, offset, length, objectHash) {
  for (var index = offset; index < offset + length; index++) {
    if (readHash(buffer, 8 + 256 * 4 + index * 20) == objectHash) {
      return index;
    }
  }
  throw "can't find hash";
}

exports.read = function(objectHash, callback) {
  async.waterfall([
    findPackName,
    function(packName, callback) {
      var indexPath = path.join(repo.gitDirectory, 'objects', 'pack', packName + '.idx');
      fs.readFile(indexPath, callback);
    },
    function(buffer, callback) {
      var hashTableBlockLocation = readFanOutTable(buffer, objectHash);
      var hashTableIndex = findHashTableIndex(buffer, hashTableBlockLocation.offset,
        hashTableBlockLocation.length, objectHash);
      console.log(hashTableIndex);
    }
  ], callback);
};

