var crypto = require('crypto');

function parseHexString(string) {
  return new Buffer(string, 'hex');
}

function toHexString(buffer, offset) {
  offset = offset || 0;
  return buffer.toString('hex', offset, 20);
}

function Hash(stringValue) {
  var bufferValue = parseHexString(stringValue);

  this.toString = function() {
    return stringValue;
  };

  this.firstByte = function() {
    return bufferValue[0];
  };

  this.toBuffer = function(buffer, offset) {
    buffer = buffer || new Buffer(20);
    bufferValue.copy(buffer, offset);
    return buffer;
  };

  this.compareTo = function(buffer, offset) {
    offset = offset || 0;
    for (var i = 0; i < 20; i++) {
      var a = bufferValue[i], b = buffer[offset + i];
      if (a != b) {
        return a < b ? -1 : 1;
      }
    }
    return 0;
  };
}

module.exports = function(x, offset) {
  if (x instanceof Hash) {
    return x;
  } else if (typeof(x) == 'string') {
    return new Hash(x);
  } else {
    return new Hash(toHexString(x, offset));
  }
};

module.exports.generate = function(buffer) {
  var hash = crypto.createHash('sha1');
  hash.update(buffer);
  return new Hash(hash.digest('hex'));
};