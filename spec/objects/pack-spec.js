var pack = require('../../lib/objects/pack'),
    data = require('./data');

describe('Reading an object from a pack file', function() {
  data();

  it('...', function(done) {
    // commit 55909454d434f0333f691a53abeee83c8a0ee0f0
    // blob-delta 55f026971815a5fb9b08f78209e2c0ea3ebfc88e
    // tree dcec34619907b6683521e1df0be609cc1f1a469e
    // blob-delta 2109a4640d515cf0818fafe893fcbb194ea242ad
    // blob 9c430e3ab135cc0c9531fbfd5e7302c2f692f287
    pack.read("dcec34619907b6683521e1df0be609cc1f1a469e", function(error, buffer) {
      // offset = 170
      console.log(arguments);
      done();
    });
  });

});





