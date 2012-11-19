var Stream = require('stream').Stream;
var util = require('util');

function TruncatingStream(maxByteCount) {
  this.bytesWritten = 0;
  this.maxByteCount = maxByteCount;
  this.readable = this.writable = true;
}
util.inherits(TruncatingStream, Stream);

TruncatingStream.prototype.write = function(data) {
  if (this.bytesWritten + data.length > this.maxByteCount) {
    data = data.slice(0, this.maxByteCount - this.bytesWritten);
  }
  this.emit('data', data);
  if (this.bytesWritten + data.length == this.maxByteCount) {
    this.end();
  }
};

TruncatingStream.prototype.end = function() {
  this.emit('end');
};

TruncatingStream.prototype.destroy = function() {
  this.emit('close');
};

module.exports = TruncatingStream;