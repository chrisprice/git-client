var hash = require('../../lib/objects/hash-utils');;

describe('Hash', function() {
  it('Should convert a hex string into a buffer representation', function() {
    var objectHash = hash("bd9dbf5aae1a3862dd1526723246b20206e5fc37");
    var buffer = new Buffer(20);
    expect(objectHash.compareTo(buffer)).toEqual(1);
    objectHash.toBuffer(buffer);
    expect(objectHash.compareTo(buffer)).toEqual(0);
  });

  it('Should convert a buffer representation into a hex string', function() {
    var hexString = hash(new Buffer([0xbd, 0x9d, 0xbf, 0x5a, 0xae, 0x1a, 0x38, 0x62, 0xdd, 0x15, 0x26, 0x72, 0x32, 0x46, 0xb2, 0x02, 0x06, 0xe5, 0xfc, 0x37])).toString();
    expect(hexString).toEqual("bd9dbf5aae1a3862dd1526723246b20206e5fc37");
  });

});





