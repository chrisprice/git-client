var packIndex = require('../../../lib/objects/pack/index'),
    path = require('path');

describe('Pack index', function() {
  it('Should read the checksum and offset for a hash', function(done) {
    var indexPath = path.join(__dirname, "../data/objects/pack/pack-b35d4e9591a39133f8ebc6c6ad566b1690aeea56.idx");
    packIndex.read(indexPath, "55909454d434f0333f691a53abeee83c8a0ee0f0", function(error, result) {
      console.log(arguments);
      expect(result.offset).toBe(4199);
      expect(result.checksum).toBe(3789464442);
      done();
    });
  });
});