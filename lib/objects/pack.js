var async = require('async');
var index = require('./pack/index');
var pack = require('./pack/pack');

exports.read = function(indexFile, packFile, callback) {
  async.waterfall([
    function (callback) {
      index.read(indexFile, callback);
    },
    function (index, callback) {
      pack.read(packFile, index, callback);
    }
  ], callback);
};

