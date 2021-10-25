#!/usr/bin/env node
/* WARNING: Do not use automatic license update for this file.
Node.js ignore shebang only if it is the very first line of the file.
It won't work even if there's an empty line or comment line before it.
*/
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
const main = require('./dist/main/src/index').main;
const version = require('./package.json').version;
main(process.argv, version);