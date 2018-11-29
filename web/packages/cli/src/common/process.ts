/**
 * Copyright 2017-2018 Plexus Interop Deutsche Bank AG
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { spawn } from 'child_process';

export function simpleSpawn(execPath: string, args: string[] = [], printOutput: boolean = false): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const errorsBuffer: string[] = [];
        const child = spawn(execPath, args, {
            detached: true
        });
        child.stdout.on('data', data => {
            if (printOutput) {
                console.log(`${data}`);
            }
        });
        child.stderr.on('data', data => {
            if (printOutput) {
                console.error(`${data}`);
            } else {
                errorsBuffer.push(`${data}`);
            }
        });
        child.on('exit', (code, signal) => {
            if (code !== 0) {
                if (errorsBuffer.length > 0) {
                    console.error(errorsBuffer.join('\n'));
                }
                reject(new Error(`Child process completed with error code: ${code}, please use --verbose flag to see whole output`));
            } else {
                resolve();
            }
        });
        child.on('error', error => {
            console.error('Process finished with error', error);
            reject(error);
        });
    });
}