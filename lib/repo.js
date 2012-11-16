var fs = require('fs'),
    path = require('path');

var gitDirectory = path.resolve('.');
while (gitDirectory != '.') {
  if (fs.existsSync(path.join(gitDirectory, '.git'))) {
    break;
  }
  gitDirectory = path.dirname(gitDirectory);
}

exports.gitDirectory = gitDirectory;