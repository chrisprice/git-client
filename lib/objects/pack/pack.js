var Reader = require('../../reader'),
    async = require('async'),
    crc32 = require('crc32');

function Pack() {
  //''P', 'A', 'C', 'K''
  // 2
  // object count
  this.objects = [];
  // checksum
}

Pack.read = function(buffer, index, callback) {
  var reader = new Reader(buffer);
  if (reader.readUtf8(4) != 'PACK' || reader.readUInt32() != 2) {
    throw 'Unknown pack file format';
  }
  var objectCount = reader.readUInt32();
  if (index.list.length != objectCount) {
    throw 'Index file does not match pack file';
  }
  var offsetOrder = index.list.slice().sort(function(a, b) {
    return a.offset > b.offset ? 1 : a.offset < b.offset ? -1 : 0;
  });
  var objects = offsetOrder.map(function(index, i) {
    var header = readPackedObjectHeader(reader);
    var object = {
      index: index,
      header: header
    };
    if (header.type == 'ofsDelta') {
//      object.offset = readVariableLengthOffset(reader);
//      console.log("obj", object);
//      reader.inflate(header.size, function(error) {
//        if (error) throw error;
//      });
    } else if (header.type == 'refDelta') {
//      object.reference = reader.readSha1();
//      reader.inflate(header.size, function(error) {
//        if (error) throw error;
//      });
    } else {
      var nextIndex = offsetOrder[i + 1];
      var length = (nextIndex ? nextIndex.offset : buffer.length - 20) - index.offset - header.headerLength;
      reader.inflate(length, function(error, buffer) {
        if (error) throw error;
        console.log(buffer.toString('utf8'));
      });

    }



    return object;
  });

  callback(null, objects);
};

var TYPES = {
  1: 'commit',
  2: 'tree',
  3: 'blob',
  4: 'tag',
  // 5: reserved,
  6: 'ofsDelta',
  7: 'refDelta'
};

function readPackedObjectHeader(reader) {
  var byte0 = reader.readUInt8();
  var type = (byte0 & parseInt('01110000', 2)) >> 4;
  var size = (byte0 & parseInt('00001111', 2));
  var headerLength = 1;
  do {
    var byteN = reader.readUInt8();
    // this is bollocks as soon as it hits 3 bytes!
    size += (byteN & parseInt('01111111', 2)) * Math.pow(2, headerLength == 1 ? 4 : 7);
    headerLength++;
  } while ((byteN & parseInt('10000000', 2)) > 0);
  return {
    type:TYPES[type],
    size:size,
    headerLength: headerLength
  };
}

function readVariableLengthOffset(reader) {
  var size = 0, i = 0;
  do {
    var byteN = reader.readUInt8();
    console.log("byteN", byteN.toString(2));
    size += (byteN & parseInt('01111111', 2)) * Math.pow(2, 7 * i);
    i++;
  }
  while ((byteN & parseInt('10000000', 2)) > 0);
  console.log("size", size);
  return size;
}

module.exports = Pack;