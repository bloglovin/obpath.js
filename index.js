/* jshint node: true */
'use strict';

var ob = {
  compile: require('./compile'),
  evaluate: require('./evaluate')
};

// Export our compile functions.
exports.compile = ob.compile.compile;
exports.mustCompile = ob.compile.mustCompile;

// Add the evaluate function to the path prototype.
ob.compile.Path.prototype.evaluate = function evaluate(object) {
  return ob.evaluate(this, object);
};
