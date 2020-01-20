/**
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
import { pbjs, pbts } from 'protobufjs/cli';
import * as os from 'os';
import * as path from 'path';
import { getBaseDir } from '../common/files';

export function genJsStaticModule(outFilePath: string, protoFiles: string[], namespace: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        pbjs.main(['--force-long', '--no-delimited', '--sparse', '-t', 'static-module', '-r', namespace, '-w', 'commonjs', '-o', outFilePath, ...protoFiles], (error, output) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
            return {};
        });
    });
}

export function getPbJsExecPath(): string {
    return path.resolve(getBaseDir(), 'node_modules', '.bin', os.platform() === 'win32' ? 'pbjs.cmd' : 'pbjs');
}

export function genTsStaticModule(outFilePath: string, jsGeneratedFilePath: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        pbts.main(['--force-long', '-o', outFilePath, jsGeneratedFilePath], (error, output) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
            return {};
        });
    });
}

