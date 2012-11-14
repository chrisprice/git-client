var fs = require('fs');
var crypto = require('crypto');
var zlib = require('zlib');
var path = require('path');
var async = require('async');

var encoding = 'utf-8';


// .git/objects/d6/70460b4b4aece5915caf5c68d12f560a9fe3e4

function readObject(hash, callback) {
  var objectPath = path.join(['.', '.git', 'objects', hash.substr(0, 2), hash]);
  async.waterfall([
    fs.readFile.bind(fs, objectPath, encoding),
    zlib.gunzip(zlib, buffer)
  ], callback);
}

readObject();