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

// Work around for // https://github.com/yarnpkg/yarn/issues/3330

const fs = require('fs')

const backward = process.argv.indexOf('--backward') !== -1;
const paramName = "NPM_REGISTRY";

console.log(`Looking for ${paramName} env variable`);

const value = process.env[paramName];
if (!value) {
    console.log(`${paramName} Env variable is empty`);
    process.exit(0);
}

const replace = (from, to, file) => {

    console.log(`Replacing registry entries${backward ? " back" : ""} for ${file}`);

    fs.readFile(file, 'utf8', function (err,data) {
        if (err) {
            return console.log(err);
        }
        const result = data.replace(from, to);
        fs.writeFile(file, result, 'utf8', function (err) {
            if (err) return console.log(err);
        });
    });
}

console.log("Registry value found, replacing lock file entries");

let from = 'https://registry.npmjs.org';
let to = `${value}`;
if (backward) {
    const temp = from;
    from = to;
    to = temp;
}

replace(from, to, "yarn.lock");
replace(from, to, "package-lock.json");
