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

/*

    Only native modules can be used here, the main goal is to generate .npmrc based on Env variables, 
    so "npm install" will work on CI environment

*/

const fs = require('fs');
const buildRunner = process.env['BuildRunner'];

if (!!buildRunner) {
    
    console.log(`Running in CI mode, build runner: ${buildRunner}`);

    const registryVar = 'NPM_REGISTRY';
    const authTokenVar = 'NPM_AUTH_TOKEN';

    const authToken = process.env[authTokenVar];

    if (!!authToken) {
        console.log(`Auth Token length ${authToken.length}`);
    }

    fs.readFile('.ci-npmrc-tpl', 'utf8', function (err,data) {

        if (err) {
            return console.log(err);
        }
        
        let result = data.replace(`\${${registryVar}}`, process.env[registryVar]);
        result = data.replace(`\${${authTokenVar}}`, authToken);

        fs.writeFile('.cli-npmrc', result, 'utf8', function (err) {
            if (err) return console.log(err);
        });

    });

} else {
    console.log("Dev mode, .npmrc generation skipped");
}