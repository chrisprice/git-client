var index = require('../../../lib/objects/pack/index'),
    pack = require('../../../lib/objects/pack/pack'),
    fs = require('fs'),
    path = require('path');

describe('Pack', function() {
  it('Should read the pack file fully', function(done) {
    var indexPath = path.join(__dirname, "../data/objects/pack/pack-b35d4e9591a39133f8ebc6c6ad566b1690aeea56.idx");
    var buffer = fs.readFileSync(indexPath);
    index.read(buffer, function(error, result) {
      var packPath = path.join(__dirname, "../data/objects/pack/pack-b35d4e9591a39133f8ebc6c6ad566b1690aeea56.pack");
      var buffer = fs.readFileSync(packPath);
      pack.read(buffer, result, function(error, result) {
        expect(error).toBeNull();
//        console.log(result);
        done();

      });
    });
  });
});