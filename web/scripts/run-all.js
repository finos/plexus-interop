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
var argv = require('minimist')(process.argv.slice(2));
const exec = require('child_process').exec;

const { lstatSync, readdirSync } = require('fs')
const { join } = require('path')

const command = argv._[0];
const ignoreErrors = !!argv.ignoreErrors;

const isDirectory = source => lstatSync(source).isDirectory()
const getDirectories = source =>
  readdirSync(source).map(name => join(source, name))
  .filter(isDirectory);

const runSequentually = (modules, command) => {
    if (modules.length === 0) {
        console.log("No modules to process");
        process.exit();
    }
    const module = modules[0];
    console.log(`Running "npm run ${command}" for ${module}`);    
    const fullCommand = `cd ./${module} && npm run ${command}`;
    exec(fullCommand, {
            cwd: process.cwd(),
            maxBuffer: 1024 * 1024
        }, (error, stdout, stderr) => {
            if (error) {
                console.error("Error while processing the command", error);
                console.log(stderr);
                if (!ignoreErrors) {
                    process.exit();
                }
            } else {
                console.log("Command Output:");
                console.log(stdout);
            }
            runSequentually(modules.slice(1), command);
        });
};

const modules =  getDirectories("packages");

console.log(`Running "${command}" command for modules: `);
modules.forEach(m => console.log(" - " + m));

if (ignoreErrors) {
    console.log(`\n [WARNING] Error raised by specific module won't stop overall execution \n`);
}

runSequentually(modules, command);



