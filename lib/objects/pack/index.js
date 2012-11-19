var fs = require('fs');
var path = require('path');
var async = require('async');
var mkdirp = require('mkdirp');
var hash = require('../hash');

function readFanOutTable(buffer, objectHash) {
  var index = objectHash.firstByte();
  var offset = buffer.readUInt32BE(index * 4);
  var previousOffset = index == 0 ? 0 : buffer.readUInt32BE((index - 1) * 4);
  return {
    offset: previousOffset,
    length: offset - previousOffset,
    objectCount: buffer.readUInt32BE(255 * 4)
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

exports.read = function(indexFilePath, objectHash, callback) {
  objectHash = hash(objectHash);
  fs.open(indexFilePath, 'r', 0666, function(error, fd) {
    // verify header?
    var headerLength = 8;
    var fanOutTableLength = 256 * 4;
    var fanOutTable = new Buffer(fanOutTableLength);
    fs.read(fd, fanOutTable, 0, fanOutTable.length, headerLength, function(error, bytesRead, buffer) {
      var result = readFanOutTable(fanOutTable, objectHash);
      var offsetTableLength = result.objectCount * 20;
      var offsetTableBlock = new Buffer(result.length * 20);
      fs.read(fd, offsetTableBlock, 0, offsetTableBlock.length, headerLength + fanOutTableLength + result.offset * 20,
          function(error, bytesRead, buffer) {
            var objectIndex = binarySearch(buffer, objectHash);
            var fourByteBuffer = new Buffer(4);
            fs.read(fd, fourByteBuffer, 0, fourByteBuffer.length, headerLength + fanOutTableLength + offsetTableLength + objectIndex * 4,
                function(error, bytesRead, buffer) {
                  var checksumValue = buffer.readUInt32BE(0);
                  var checksumTableLength = result.objectCount * 4;
                  fs.read(fd, fourByteBuffer, 0, fourByteBuffer.length, headerLength + fanOutTableLength + offsetTableLength + checksumTableLength + objectIndex * 4,
                      function(error, bytesRead, buffer) {
                        var offsetValue = buffer.readUInt32BE(0);
                        // verify footer?
                        callback(null, {
                          checksum: checksumValue,
                          offset: offsetValue
                        });
                      });
                });
          });
    });

  });
};

