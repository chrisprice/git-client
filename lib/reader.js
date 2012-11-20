var zlib = require('zlib'),
    crypto = require('crypto');

function Reader(buffer, offset) {
  offset = offset || 0;

  this.readUtf8 = function(length) {
    var start = offset;
    if (length === undefined) {
      // read until null byte
      while (this.readUInt8()) {
        length = offset - start;
      }
    } else {
      offset += length;
    }
    return buffer.toString('utf8', start, start + length);
  };

  this.readUInt32 = function() {
    var uint32 = buffer.readUInt32BE(offset);
    offset += 4;
    return uint32;
  };

  this.readUInt8 = function() {
    var uint8 = buffer.readUInt8(offset);
    offset += 1;
    return uint8;
  };

  this.readSha1 = function(length) {
    length = length || 20;
    var hash = buffer.toString('hex', offset, offset + length);
    offset += length;
    return hash;
  };

  this.inflate = function(length, callback) {
    var dataBuffer = buffer.slice(offset, offset + length);
    offset += length;
    zlib.inflate(dataBuffer, function(error, buffer) {
      callback(error, new Reader(buffer));
    });
  };

  this.computeSha1 = function() {
    var hash = crypto.createHash('sha1');
    hash.update(buffer.slice(0, offset));
    return hash.digest('hex');
  }

  this.remaining = function() {
    return buffer.length - offset;
  }
}

module.exports = Reader;