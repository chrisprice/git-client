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
  if (offsetOrder[0].offset != reader.bytesRead()) {
    throw 'Invalid starting offset';
  }
  var objects = offsetOrder.map(function(index, i) {
    var nextIndex = offsetOrder[i + 1];
    var interOffsetLength = (nextIndex ? nextIndex.offset : buffer.length - 20) - index.offset;
    if (parseInt(index.checksum, 16) != parseInt(crc32(buffer.slice(index.offset, index.offset + interOffsetLength)), 16)) {
      console.log(index.checksum, crc32(buffer.slice(index.offset, index.offset + interOffsetLength)));
      throw "Checksum failure";
    }
    if (index.offset != reader.bytesRead()) {
      console.log(index.offset, reader.bytesRead())
      throw "I've lost my place, sad face...";
    }
    var header = readPackedObjectHeader(reader);
    index.type = header.type;
    var object = {
      index: index,
      header: header
    };

//    console.log(i, index.offset, nextIndex.offset, header.headerLength, interOffsetLength, index.hash, header.type, header.typeCode);
    if (header.type == 'ofsDelta') {
      reader.skip(interOffsetLength - header.headerLength);
//      object.offset = readVariableLengthOffset(reader);
//      reader.inflate(header.size, function(error) {
//        if (error) throw error;
//      });
    } else if (header.type == 'refDelta') {
      reader.skip(interOffsetLength - header.headerLength);
//      object.reference = reader.readSha1();
//      reader.inflate(header.size, function(error) {
//        if (error) throw error;
//      });
    } else {
      reader.inflate(interOffsetLength - header.headerLength, function(error, buffer) {
        if (error) {
          console.log(index.hash, header, offsetOrder.slice(0, i + 1));
          throw error;
        }
        if (header.type == 'commit') {
          console.log(buffer.toString('utf8'));
        }
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
  // all these bit wise operations mean we fail dangerously if we hit a 4 byte header
  var byte = reader.readUInt8();
  var headerLength = 1;
  var typeCode = (byte & parseInt('01110000', 2)) >> 4;
  var size = (byte & parseInt('00001111')) << 3; // roll 3 forward to make the code easier
  while ((byte & parseInt('10000000', 2)) > 0) {
    byte = reader.readUInt8();
    size |= (byte & parseInt('01111111', 2)) << 7 * headerLength;
    headerLength++;
  }
  size = size >> 3;                              // roll 3 back to undo our earlier fudge
  return {
    type:TYPES[typeCode],
    typeCode: typeCode,
    size:size,
    headerLength: headerLength
  };
}

function readVariableLengthOffset(reader) {
  // all these bit wise operations mean we fail dangerously if we hit a 4 byte header
  var size = 0, headerLength = 0;
  do {
    var byte = reader.readUInt8();
    size |= (byte & parseInt('01111111', 2)) << 7 * headerLength;
    headerLength++;
  }
  while ((byte & parseInt('10000000', 2)) > 0);
  return size;
}

module.exports = Pack;