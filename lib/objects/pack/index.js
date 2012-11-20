var Reader = require('../../reader');

function Index() {
  this.map = {};
  this.list = [];
  this.packChecksum = 0;
}

Index.read = function(buffer, callback) {
  var reader = new Reader(buffer);
  if (reader.readUInt8() != 0377 || reader.readUtf8(3) != 'tOc' || reader.readUInt32() != 2) {
    return callback('Unknown index format');
  }
  var index = new Index();
  // fan out table
  for (var i = 0; i < 255; i++) {
    reader.readUInt32();
  }
  var objectCount = reader.readUInt32();;
  for (i = 0; i < objectCount; i++) {
    var hash = reader.readSha1();
    var object = {
      hash: hash
    };
    index.list.push(object);
    index.map[hash] = object;
  }
  for (i = 0; i < objectCount; i++) {
    index.list[i].checksum = reader.readSha1(4); // TODO fix method name
  }
  for (i = 0; i < objectCount; i++) {
    var offset = reader.readUInt32();
    if (offset & 0x80000000) {
      return callback('Large offsets unsupported');
    }
    index.list[i].offset = offset;
  }
  index.packChecksum = reader.readSha1();

  var checksum = reader.computeSha1();
  if (checksum != reader.readSha1()) {
    return callback('Corrupt index file');
  }

  callback(null, index);
}

function firstByte(hash) {
  return parseInt(hash.substr(0, 2), 16);
}

module.exports = Index;

