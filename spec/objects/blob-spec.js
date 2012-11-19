var fs = require('../../lib/objects/fs'),
    blob = require('../../lib/objects/blob'),
    data = require('./data');

describe('Parsing/composing a blob', function() {
  data();

  it('Should compose a blob', function() {
    var object = blob.compose(new Buffer("what is up, doc?"));
    expect(object.toString()).toEqual(
        "blob 16\000what is up, doc?");
  });

  it('Should parse a blob', function() {
    var buffer = blob.parse(new Buffer("blob 16\000what is up, doc?"));
    expect(buffer.toString()).toEqual("what is up, doc?");
  });

});





