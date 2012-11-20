var index = require('../../../lib/objects/pack/index'),
    fs = require('fs'),
    path = require('path');

describe('PackIndex', function() {
  it('Should read the index file fully', function(done) {
    var indexPath = path.join(__dirname, "../data/objects/pack/pack-b35d4e9591a39133f8ebc6c6ad566b1690aeea56.idx");
    var buffer = fs.readFileSync(indexPath);
    index.read(buffer, function(error, result) {
      expect(error).toBeNull();
      expect(result.list.length).toBe(47);
      expect(result.map['590a0ec1ff1d4adee89a18bdf3f5a139005438fa']).toEqual({
        checksum: 3128655934,
        offset: 2458,
        hash: '590a0ec1ff1d4adee89a18bdf3f5a139005438fa'
      });
      expect(result.packChecksum).toBe('dd65475b8642ed8399a51a591a16ea324f3d874b');
      done();
    });
  });
});