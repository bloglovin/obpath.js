#!/usr/bin/env node
/* jshint node: true */
'use strict';
var obpath = require('../index');

var lib = {
	fs: require('fs'),
  docopt: require('docopt')
};

// Parse cli options
var pkg = require('../package');
var doc = lib.fs.readFileSync(__dirname + '/obp.usage.txt', {encoding:'utf8'});
var opt = lib.docopt.docopt(doc, {version: pkg.version});

var context = obpath.createContext();
var path = obpath.mustCompile(opt['<path-expression>'], context);

if (opt['--file']) {

}
else {
	readDataFromStdin();
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

// func main() {
//   path := flag.String("path", ".*", "Path expression")
//   stream := flag.Bool("stream", true, "Emit the results as a newline delimited JSON stream")
//   flag.Parse()
//
//   dec := json.NewDecoder(os.Stdin)
//   enc := json.NewEncoder(os.Stdout)
//
//   context := obpath.NewContext()
//   context.AllowDescendants = true
//
//   compiled, error := obpath.Compile(*path, context)
//   if error != nil {
//     log.Fatalf("Could not compile path: %v", error)
//   }
//
//   index := 0
//   len := 8
//   buffer := make([]interface{}, len)
//
//   for {
//     var input interface{}
//     result := make(chan interface{})
//
//     if err := dec.Decode(&input); err != nil {
//       if err == io.EOF {
//         break
//       } else {
//         log.Fatalf("Read JSON from stdin: %v", error)
//       }
//     }
//     go compiled.Evaluate(input, result)
//
//     if *stream {
//       for item := range result {
//         if err := enc.Encode(&item); err != nil {
//           log.Println(err)
//         }
//       }
//     } else {
//       for item := range result {
//         if index == len {
//           len *= 2
//           resized := make([]interface{}, len)
//           copy(resized, buffer)
//           buffer = resized
//         }
//         buffer[index] = item
//         index++
//       }
//     }
//   }
//
//   if !(*stream) {
//     slice := buffer[:index]
//     if err := enc.Encode(&slice); err != nil {
//       log.Fatalf("Could not write JSON to stdout: %v", error)
//     }
//   }
// }
