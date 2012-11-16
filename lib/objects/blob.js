var fs = require('fs');
var crypto = require('crypto');
var zlib = require('zlib');
var path = require('path');
var async = require('async');
var mkdirp = require('mkdirp');

function computeObjectPath(hash) {
  return path.join('.', '.git', 'objects', hash.substr(0, 2), hash.substr(2));
}

function writeObject(buffer, callback) {
  var hash = crypto.createHash('sha1');
  hash.update(buffer);
  var objectPath = computeObjectPath(hash.digest('hex'));
  async.waterfall([
    function (callback) {
      // can't just bind, mkdirp returns a made argument
      mkdirp(path.dirname(objectPath), function (err) {
        callback(err);
      });
    },
    zlib.deflate.bind(zlib, buffer),
    fs.writeFile.bind(fs, objectPath)
  ], callback);
}

function readObject(hash, callback) {
  async.waterfall([
    fs.readFile.bind(fs, computeObjectPath(hash)),
    zlib.inflate.bind(zlib)
  ], callback);
}

function composeObject(object) {
  if (object.type != 'blob') {
    throw "Unknown type " + object.type;
  }
  var header = new Buffer(object.type + ' ' + object.content.length + '\0', 'utf8');
  return Buffer.concat([header, object.content]);
}

function parseObject(buffer) {
  var nullByteOffset = 0;
  while (buffer[nullByteOffset] != 0) {
    nullByteOffset++;
  }
  var header = buffer.toString('utf8', 0, nullByteOffset).split(' ');
  switch (header[0]) {
    case 'blob':
      return {
        type:'blob',
        length:Number(header[1]),
        content:buffer.slice(nullByteOffset + 1)
      };
      break;
    default:
      throw "Unknown header " + header[0];
  }
}

readObject('168c335ae40fd50b59381868ccb314d5119c43a7', function (err, data) {
  console.log(err, parseObject(data));
});

writeObject(composeObject({
  type: 'blob',
  content: new Buffer('bob')
}), function(err) {
  console.error(err);
});