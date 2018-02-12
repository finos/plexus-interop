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

const shell = require('shelljs');
const argv = require('minimist')(process.argv.slice(2));

const input = argv.input;
const envVars = ['NPM_REGISTRY', 'NPM_AUTH_TOKEN', 'NPM_AUTH_USER'];

console.log(`Replacing all env variables for ${process.cwd()}/${input}`);

envVars.forEach(k => {
    if (!!process.env[k]) {
        shell.sed('-i', `\\\${${k}}`, `${process.env[k]}`, `${process.cwd()}/${input}`);    
    }
});

