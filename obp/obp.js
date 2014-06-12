#!/usr/bin/env node
/* jshint node: true */
'use strict';
var obpath = require('../index');

var lib = {
	fs: require('fs'),
	path: require('path'),
  docopt: require('docopt')
};

// Parse cli options
var pkg = require('../package');
var doc = lib.fs.readFileSync(__dirname + '/obp.usage.txt', {encoding:'utf8'});
var opt = lib.docopt.docopt(doc, {version: pkg.version});

if (opt.test) {
	var runTests = require('./obp-test');

	var obpPath = opt['<path-to-obp>'] || __filename;
	var dataPath = opt['--data'] ||
		lib.path.resolve(__dirname, '../testdata/data.json');
	var expectPath = opt['--tests'] ||
		lib.path.resolve(__dirname, '../testdata/expect.jsonstream');

	runTests(obpPath, dataPath, expectPath);
}
else {
	var context = obpath.createContext();
	context.allowDescendants = true;
	var path;

	try {
		path = obpath.mustCompile(opt['<path-expression>'], context);
	} catch (error) {
		console.log('Error:', error.message);
		process.exit(1);
	}

	if (opt['--file']) {
		var json = lib.fs.readFileSync(opt['--file'], {encoding:'utf8'});
		var object = JSON.parse(json);
		evaluate(object);
	}
	else {
		readDataFromStdin();
	}
}

function readDataFromStdin() {
	var json = '';
	process.stdin.setEncoding('utf8');

	process.stdin.on('readable', function() {
		var chunk = process.stdin.read();
		if (chunk !== null) json += chunk;
	});

	process.stdin.on('end', function() {
		var object = JSON.parse(json);
		evaluate(object);
	});
}

function evaluate(object) {
	var matches = path.evaluate(object);
	if (opt['--stream']) {
		matches.forEach(function writeItem(item) {
			console.log(JSON.stringify(item));
		});
	}
	else {
		var indent = opt['--indent'] ? '  ' : undefined;
		console.log(JSON.stringify(matches, null, indent));
	}
}
