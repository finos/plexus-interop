/*
 * Copyright 2017-2020 Plexus Interop Deutsche Bank AG
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

const install = process.argv.indexOf('--install') !== -1;

console.log(`Preparing .npmrc file for ${install ? "install" : "publish"}`);

const postfix = install ? "_INSTALL" : "_PUBLISH";

const buildRunner = process.env['BuildRunner'];

if (!!buildRunner) {
    
    console.log(`Running in CI mode, build runner: ${buildRunner}`);

    const registryVar = 'NPM_REGISTRY';
    const authTokenVar = 'NPM_AUTH_TOKEN';

    const authToken = process.env[`${authTokenVar}${postfix}`] || process.env[authTokenVar];
    let registry = process.env[`${registryVar}${postfix}`] || process.env[registryVar];
    const templateFile = install ? '.ci-npmrc-tpl' : '.ci-publish-npmrc-tpl';

    if (!!authToken) {
        console.log(`Auth Token length ${authToken.length}`);
    }

    if (!!registry) {
        console.log(`Registry value ${registry}`);
    }

    if (!authToken || !registry) {

        console.log("Not all auth variables provided");
        
        fs.writeFile('.npmrc', "# Auto generated during CI build", 'utf8', function (err) {
            if (err) return console.log(err);
        });

    } else {

        if (!install) {
            // clear http/https for publish
            registry = registry.replace("https:", "");
            registry = registry.replace("http:", "");
        }

        const disableStrictSsl = process.env['NPM_STRICT_SSL'] === 'false';
        const enableAlwaysAuth = process.env['NPM_ALWAYS_AUTH'] === 'true';

        fs.readFile(templateFile, 'utf8', function (err,data) {
            if (err) {
                return console.log(err);
            }
            data = data.replace(`\${${registryVar}}`, registry);
            data = data.replace(`\${${authTokenVar}}`, authToken);

            if (disableStrictSsl) {
                console.log('Updating strict ssl setting');
                data += `\nstrict-ssl=false`;
            }

            if (enableAlwaysAuth) {
                console.log('Enabling always auth');
                data += `\nalways-auth=true`;
            }
            
            fs.writeFile('.npmrc', data, 'utf8', function (err) {
                if (err) return console.log(err);
            });
        });

        if (disableStrictSsl) {
            console.log('Generating .yarnrc');
            fs.readFile('.yarnrc', 'utf8', function (err,data) {
                if (err) {
                    return console.log(err);
                }    
                data = 'workspaces-experimental true';
                data += `\nstrict-ssl false`;
                fs.writeFile('.yarnrc', data, 'utf8', function (err) {
                    if (err) return console.log(err);
                });
            });
        }

    }

} else {
    console.log("Dev mode, .npmrc generation skipped");
}