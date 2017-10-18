/**
 * Copyright 2017 Plexus Interop Deutsche Bank AG
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var fs = require("fs");
var path = require("path");
var glob = require('glob');
var browserify = require("browserify");
var istanbul = require('browserify-istanbul');
var argv = require('minimist')(process.argv.slice(2));

console.log('Passed arguments' + JSON.stringify(argv));
var resultOutFile = path.join(process.cwd(), argv.outputFile);
console.log('Output file:' + resultOutFile);
var resultInputGlob = path.join(process.cwd(), argv.inputGlob);
console.log('Input files pattern:' + resultInputGlob);

var testFiles = glob.sync(resultInputGlob);

console.log('Processing files: ' + JSON.stringify(testFiles));

browserify({entries: testFiles})
    .transform(istanbul({
        // ignore these glob paths (the ones shown are the defaults)
    ignore: [
        // skip all node modules, except our
        '**/node_modules/!(@plexus-interop)/**', 
        // skip all generated proto messages
        '**/*-messages.js',
        '**/*-protocol.js',
        '**/index.js',
        '**/bower_components/**', 
        '**/test/**', 
        '**/tests/**', 
        '**/*.json',
        '**/*.spec.js'],
        // by default, any paths you include in the ignore option are ignored
        // in addition to the defaults. set the defaultIgnore option to false
        // to only ignore the paths you specify.
        defaultIgnore: true
    }), {global : true})
    .bundle()
    .pipe(fs.createWriteStream(argv.outputFile));