var fs = require('../../lib/objects/fs'),
    data = require('./data');

describe('Reading/writing an object to a file', function() {
  data();

  it('Should write a buffer', function(done) {
    fs.write(new Buffer("blob 16\000what is up, doc?"), function(error, hash) {
      expect(error).toBeNull();
      expect(hash.toString()).toBe("bd9dbf5aae1a3862dd1526723246b20206e5fc37");
      done();
    });
  });

  it('Should read to a buffer', function(done) {
    fs.read("bd9dbf5aae1a3862dd1526723246b20206e5fc37", function(error, buffer) {
      expect(error).toBeNull();
      expect(buffer.toString()).toBe("blob 16\000what is up, doc?");
      done();
    });
  });

});





