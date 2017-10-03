var fs = require("fs");
var path = require("path");
var glob = require('glob');
var browserify = require("browserify");
var argv = require('minimist')(process.argv.slice(2));

console.log('Passed arguments' + JSON.stringify(argv));
var resultOutFile = path.join(process.cwd(), argv.outputFile);
console.log('Output file:' + resultOutFile);
var resultInputGlob = path.join(process.cwd(), argv.inputGlob);
console.log('Input files pattern:' + resultInputGlob);

var testFiles = glob.sync(resultInputGlob);

console.log('Processing files: ' + JSON.stringify(testFiles));

browserify({entries: testFiles})
    .bundle()
    .pipe(fs.createWriteStream(argv.outputFile));