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
import { downloadProtoc } from './common/protoc';
import { downloadJre } from './common/java';
// to execute 'warmp up' of protobufjs cli at this point rather than on first execution
import 'protobufjs/cli';

export function install(): void {
    // tslint:disable-next-line:no-string-literal
    if (process.env.PLEXUS_CLI_SKIP_JRE_DOWNLOAD !== 'true') {
        downloadJre()
        .then(() => console.log('JRE downloaded'))
        .catch(e => console.error('Failed to download JRE', e));
    } else {
        console.log('JRE download skipped');
    }
    // tslint:disable-next-line:no-string-literal
    if (process.env.PLEXUS_CLI_SKIP_PROTOC_DOWNLOAD !== 'true') {
        downloadProtoc()
            .then(() => console.log('protoc downloaded'))
            .catch(e => console.error('Failed to download protoc', e));
    } else {
        console.log('protoc download skipped');
    }
}