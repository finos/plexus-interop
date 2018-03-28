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
import { deleteDirectory, createIfNotExistSync, mkdirsSync } from './common/files';
import { printProgress } from './common/progress';
import { getJreDownloadDir, getJreDownloadUrl } from './common/java';
import * as zlib from 'zlib';
import * as tar from 'tar-fs';
import * as request from 'request';
import * as unzipper from 'unzipper';

export function downloadJre(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        try {
            const url = getJreDownloadUrl();
            const jreDownloadDir = getJreDownloadDir();
            const isZip = url.endsWith('.zip');
            const isTarGz = url.endsWith('.tar.gz');
            console.log('Downloading JRE from: ', url);
            console.log('Target dir: ', jreDownloadDir);
            deleteDirectory(jreDownloadDir);
            mkdirsSync(jreDownloadDir);
            createIfNotExistSync(jreDownloadDir);
            const basePipe = request
                .get({
                    url,
                    rejectUnauthorized: false,
                    agent: false,
                    headers: {
                        connection: 'keep-alive',
                        Cookie: 'gpw_e24=http://www.oracle.com/; oraclelicense=accept-securebackup-cookie'
                    }
                })
                .on('response', (response: any) => printProgress(response, 'Downloading JRE'))
                .on('error', (error: any) => {
                    console.log(`JRE Download failed: ${error.message}`);
                    reject(error);
                })
                .on('end', () => {
                    console.log('JRE Download finished');
                    resolve(jreDownloadDir);
                });
            if (isZip) {
                basePipe.pipe(unzipper.Extract({ path: jreDownloadDir }));
            } else if (isTarGz) {
                basePipe
                    .pipe(zlib.createUnzip())
                    .pipe(tar.extract(jreDownloadDir));
            }
        } catch (error) {
            console.error('Unexpected error', error);
            reject(error);
        }
    });
}

downloadJre();