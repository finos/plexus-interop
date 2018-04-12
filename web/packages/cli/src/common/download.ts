/**
 * Copyright 2017 Plexus Interop Deutsche Bank AG
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
import { removeSync, mkdirsSync, unzipSync } from './files';
import { printProgress } from './progress';
import * as zlib from 'zlib';
import * as tar from 'tar-fs';
import * as request from 'request';
import * as path from 'path';
import * as fs from 'fs';

export function downloadPackage(url: string, downloadDir: string, title: string = 'Package', headers: any = {}): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        try {
            const isZip = url.endsWith('.zip');
            const isTarGz = url.endsWith('.tar.gz');
            const fileName = url.split('/').pop() as string;
            console.log(`Downloading ${title} from: `, url);
            console.log('Target dir: ', downloadDir);
            removeSync(downloadDir);
            mkdirsSync(downloadDir);
            const responsePipe = request
                .get({
                    url,
                    rejectUnauthorized: false,
                    agent: false,
                    headers
                })
                .on('response', (response: any) => printProgress(response, `Downloading ${title}`))
                .on('error', (error: any) => {
                    console.error(`${title} download failed`, error);
                    reject(error);
                });
            if (isTarGz) {
                responsePipe
                    .pipe(zlib.createUnzip())
                    .pipe(tar.extract(downloadDir))
                    .on('end', () => {
                        console.log(`${title} download finished`);
                        resolve(downloadDir);
                    });
            } else {
                responsePipe
                    .pipe(fs.createWriteStream(path.join(downloadDir, fileName)))
                    .on('close', () => {
                        console.log(`${title} download finished`);
                        if (isZip) {
                            const zipPath = path.join(downloadDir, fileName);
                            unzipSync(zipPath, downloadDir);
                        }
                        resolve(downloadDir);
                    });
            }
        } catch (error) {
            console.error('Unexpected error', error);
            reject(error);
        }
    });
}