var types = {
  1: 'commit',
  2: 'tree',
  3: 'blob',

  6: 'blob-delta'
};

exports.readPackedObjectHeader = function (buffer) {
  var byte0 = buffer[0];
  var type = (byte0 & parseInt('01110000', 2)) >> 4;
  var size = (byte0 & parseInt('00001111', 2));
  var dataOffset = 1;
  do {
    var byteN = buffer[dataOffset];
    size += (byteN & parseInt('01111111', 2)) * Math.pow(2, dataOffset == 1 ? 4 : 7);
    dataOffset++;
  } while ((byteN & parseInt('10000000', 2)) > 0);
  if (!types[type]) {
    console.log("Unknown type - " + type);
  }
  return {
    type:types[type],
    size:size,
    dataOffset:dataOffset
  };
}