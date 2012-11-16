var crypto = require('crypto');

module.exports = function hash(buffer) {
  var hash = crypto.createHash('sha1');
  hash.update(buffer);
  return hash.digest('hex');
};