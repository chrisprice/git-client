var pack = require('../../lib/objects/pack'),
    data = require('./data');

describe('Reading an object from a pack file', function() {
  data();

  it('...', function(done) {
    pack.read("55f026971815a5fb9b08f78209e2c0ea3ebfc88e", function(error, buffer) {
      console.log(arguments);
      done();
    });
  });

});





