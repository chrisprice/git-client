var pu = require('../../../lib/objects/pack/pack-utils');

describe('Pack file utilities', function() {
  it('Should read header', function() {
    var buffer = new Buffer("9a0e789c9d8e510ac3201044ff3dc5fe175257a35128a5d00bf40aba6e1a", 'hex');
    var header = pu.readPackedObjectHeader(buffer);
    expect(header.type).toBe('commit');
    expect(header.size).toBe(234); // 1010 000 1110
    expect(header.dataOffset).toBe(2);
  });

});
