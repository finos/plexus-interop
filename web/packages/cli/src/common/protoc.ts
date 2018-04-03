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
import * as path from 'path';
import * as os from 'os';
import { getDistDir, iterateFiles, mkdirsSync, copyFile, removeSync, exists } from './files';
import { downloadPackage } from './download';

const getDownloadDir = () => path.join(getDistDir(), 'protoc');

export async function downloadProtoc(): Promise<string> {
    const url = getProtocDownloadUrl();
    const downloadDir = getDownloadDir();
    const title = 'Protoc';
    await downloadPackage(url, downloadDir, title);
    if (url.endsWith('.exe')) {
        // direct file link to exe file, move it to bin/proto.exe
        const downloadedExe = await new Promise<string>((resolve, reject) => {
            let temp = null;
            iterateFiles(downloadDir, /protoc.*\.exe/g, f => temp = f, false);
            if (temp) {
                resolve(temp);
            } else {
                reject(new Error('Protoc EXE not found'));
            }
        });
        console.log('Downloaded exe file', downloadedExe); 
        mkdirsSync(path.join(downloadDir, 'bin'));
        const targetFile = path.join(downloadDir, 'bin', 'protoc.exe');
        console.log('Copying to', targetFile);        
        await copyFile(downloadedExe, targetFile);
        console.log(`Clearing ${downloadedExe}`);
        removeSync(downloadedExe);
    }
    return downloadDir;
}

export async function protocExecProvided(): Promise<string> {
    const execPath = await getProtocExecPath();
    const execExists = await exists(execPath);
    if (execExists) {
        return execPath;
    } else {
        throw new Error(`Do not exist ${execPath}`);
    }
}

export async function getProtocExecPath(): Promise<string> {
    if (process.env.PLEXUS_CLI_PROTOC_EXE_PATH) {
        console.log(`Using protoc from env variable ${process.env.PLEXUS_CLI_PROTOC_EXE_PATH}`);
        return process.env.PLEXUS_CLI_PROTOC_EXE_PATH;
    }
    const baseDir = getDownloadDir();
    return path.join(baseDir, ...getExePath());
}

export function getProtocDownloadUrl(): string {
    const platform = `${os.platform()}-${os.arch()}`;
    return process.env[`PLEXUS_PROTOC_DOWNLOAD_URL_${platform.toUpperCase()}`]
        || process.env.PLEXUS_PROTOC_DOWNLOAD_URL
        || getDefaultDownloadUrl(platform);
}

function getExePath(): string[] {
    return os.platform() === 'win32' ? ['bin', 'protoc.exe'] : ['bin', 'protoc'];
}

function getDefaultDownloadUrl(platform: string): string {
    switch (platform) {
        case 'win32-x32':
        case 'win32-x64':
            return 'https://github.com/google/protobuf/releases/download/v3.5.1/protoc-3.5.1-win32.zip';
        default:
            throw new Error(`${platform} is not supported`);
    }
}
