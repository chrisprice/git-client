var fs = require('fs');
var repo = require('../repo');
var hash = require('./hash');
var path = require('path');
var async = require('async');
var mkdirp = require('mkdirp');
var pu = require('./pack/pack-utils');
var zlib = require('zlib');

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
  var index = objectHash.firstByte();
  var offset = readFanOutTableValue(buffer, index);
  var previousOffset = index == 0 ? 0 : readFanOutTableValue(buffer, index - 1);
  var objectCount = readFanOutTableValue(buffer, 255);
  return {
    offset: previousOffset,
    length: offset - previousOffset,
    objectCount: objectCount
  };
}

function binarySearch(buffer, objectHash) {
  var low = 0, high = buffer.length / 20 - 1,
      i, comparison;
  while (low <= high) {
    i = Math.floor((low + high) / 2);
    comparison = objectHash.compareTo(buffer, i * 20);
    if (comparison == 0) { return i; };
    if (comparison < 0)  { high = i - 1;};
    if (comparison > 0)  { low = i + 1;};
  }
  return null;
}

function findHashTableIndex(buffer, offset, length, objectHash) {
  var start = 8 + 256 * 4 + offset * 20;
  var end = start + length * 20;
  var hashTable = buffer.slice(start, end);
  return offset + binarySearch(hashTable, objectHash);
}

function readOffsetTableValue(buffer, index, count) {
  var offset = 8 + 256 * 4 + count * 20 + count * 4 + index * 4;
  console.log(buffer.toString('hex', offset - 4, offset + 8));
  return buffer.readUInt32BE(offset);
}

exports.read = function(objectHash, callback) {
  objectHash = hash(objectHash);
  var cachedPackName;
  var cachedOffsetTableValue;
  var cachedHeader;
  async.waterfall([
    findPackName,
    function(packName, callback) {
      cachedPackName = packName;
      var indexPath = path.join(repo.gitDirectory, 'objects', 'pack', packName + '.idx');
      fs.readFile(indexPath, callback);
    },
    function(buffer, callback) {
      var hashTableBlockLocation = readFanOutTable(buffer, objectHash);
      console.log(hashTableBlockLocation);
      var hashTableIndex = findHashTableIndex(buffer, hashTableBlockLocation.offset,
        hashTableBlockLocation.length, objectHash);
      console.log(hashTableIndex);
      var offsetTableValue = readOffsetTableValue(buffer, hashTableIndex, hashTableBlockLocation.objectCount);
      console.log(offsetTableValue);
      callback(null, offsetTableValue);
    },
    function(offsetTableValue, callback) {
      cachedOffsetTableValue = offsetTableValue;
      var packPath = path.join(repo.gitDirectory, 'objects', 'pack', cachedPackName + '.pack');
      fs.readFile(packPath, callback);
    },
    function(buffer, callback) {
//      console.log(buffer.toString('hex', cachedOffsetTableValue));
      var header = pu.readPackedObjectHeader(buffer.slice(cachedOffsetTableValue, Math.min(cachedOffsetTableValue + 1024, buffer.length)));
      cachedHeader = header;
      console.log("Header:" + header.type + ", " + header.size);
      // HOW DO I KNOW THE LENGTH?
      var start = cachedOffsetTableValue + header.dataOffset;
      var end = cachedOffsetTableValue + header.dataOffset + header.size;
      console.log(start, end, buffer.length);
      var content = buffer.slice(start, end);
      zlib.inflate(content, callback);
      var packPath = path.join(repo.gitDirectory, 'objects', 'pack', cachedPackName + '.pack');
      var fileStream = fs.createReadStream(packPath, {start: start});
      var inflateStream = zlib.createInflate();
      fileStream.pipe(zlib.createInflate()).on('data', function (buffer) {
        console.log(buffer.toString('utf8'));
      });

    },
    function(object, callback) {
//      console.log(object.toString('hex'));
//      console.log(object.toString());
    }
  ], callback);
};

