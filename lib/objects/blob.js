var async = require('async');

exports.compose = function(buffer) {
  var header = new Buffer('blob ' + buffer.length + '\0', 'utf8');
  return Buffer.concat([header, buffer]);
};

exports.parse = function(buffer) {
  var nullByteOffset = 0;
  while (buffer[nullByteOffset] != 0) {
    nullByteOffset++;
  }
  return buffer.slice(nullByteOffset + 1);
};

