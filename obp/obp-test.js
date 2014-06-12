/* jshint node: true */
'use strict';

var lib = {
  assert: require('assert'),
  fs: require('fs'),
  child_process: require('child_process'),
  Linerstream: require('linerstream')
};

module.exports = function runTests(obpPath, dataPath, expectPath) {
  var stream = new lib.Linerstream({
    highWaterMark: 1
  });
  lib.fs.createReadStream(expectPath).pipe(stream);

  stream.on('data', function lineWasRead(line) {
    var test = JSON.parse(line);
    var output = '';

    var child = lib.child_process.spawn(obpPath, [
      test.Path, '--file=' + dataPath
    ], {
      stdio: ['ignore', 'pipe', process.stderr]
    });

    child.stdout.on('data', function chunkRead(chunk) {
      output += chunk;
    });

    child.on('close', function childExited(code) {
      if (code) {
        console.log(JSON.stringify(test.Name), 'failed');
      }
      else {
        var results = JSON.parse(output);

        try {
          lib.assert.deepEqual(results, test.Results,
            JSON.stringify(test.Name) + ' failed: Didn\'t get the expected results');
        }
        catch (error) {
          console.error(error.message);
          console.error(results);
          return;
        }

        console.log(JSON.stringify(test.Name), 'passed');
      }
    });
  });
};
