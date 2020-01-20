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
/**
 * Adds hook to save coverage info (if any) after finishing of electron tests
 */

'use strict'
const glob = require('glob')
const { resolve, join } = require('path')
const { writeFileSync, existsSync, mkdirSync } = require('fs');

// write coverage info to root, so we can build report against all components 
const root = resolve(__dirname, '../../..');
const tmpd = resolve(root, '.nyc_output');

function report() {
    console.log(`Writing coverage report to ${tmpd}`);
    try {
        if (!existsSync(tmpd)){
            mkdirSync(tmpd);
        }
        writeFileSync(join(tmpd, `coverage.json`), JSON.stringify(coverageInfo), 'utf-8');
    } catch (e) {
        console.log("Error", e);
    }
}

const coverageInfo = global.__coverage__ = {}

if (window) {
    window.addEventListener('unload', report);
}

