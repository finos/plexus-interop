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
import * as path from 'path';
import * as os from 'os';
import { getDirectories, getDistDir, exists } from './files';
import { downloadPackage } from './download';

export function downloadJre(): Promise<string> {
    const url = getJreDownloadUrl();
    const downloadDir = getJreDownloadDir();
    const title = 'JRE';
    return downloadPackage(url, downloadDir, title, {
        connection: 'keep-alive',
        Cookie: 'gpw_e24=http://www.oracle.com/; oraclelicense=accept-securebackup-cookie'
    });
}

export async function javaExecProvided(): Promise<string> {
    const execPath = await getJavaExecPath();
    const execExists = await exists(execPath);
    if (execExists) {
        return execPath;
    } else {
        throw new Error(`Do not exist ${execPath}`);
    }
}

export function getJreDownloadUrl(): string {
    const platform = `${os.platform()}-${os.arch()}`;
    return process.env[`PLEXUS_JRE_DOWNLOAD_URL_${platform.toUpperCase()}`]
        || process.env.PLEXUS_JRE_DOWNLOAD_URL
        || getDefaultDownloadUrl(platform);
}

function getDefaultDownloadUrl(platform: string): string {
    switch (platform) {
        case 'win32-ia32':
        case 'win32-x32':
            return 'http://download.oracle.com/otn-pub/java/jdk/8u161-b12/2f38c3b165be4555a1fa6e98c45e0808/jre-8u161-windows-i586.tar.gz';
        case 'win32-x64':
            return 'http://download.oracle.com/otn-pub/java/jdk/8u161-b12/2f38c3b165be4555a1fa6e98c45e0808/jre-8u161-windows-x64.tar.gz';
        default:
            throw new Error(`${platform} is not supported`);
    }
}

export function getJreBaseDir(downloadDir: string): string {
    const childs = getDirectories(downloadDir);
    if (childs.length === 0) {
        throw new Error('No JRE found');
    }
    return path.join(downloadDir, childs[0]);
}

export async function getJavaExecPath(): Promise<string> {
    if (process.env.PLEXUS_CLI_JAVA_EXE_PATH) {
        console.log(`Using Java executable from env variable ${process.env.PLEXUS_CLI_JAVA_EXE_PATH}`);
        return process.env.PLEXUS_CLI_JAVA_EXE_PATH as string;
    }
    const baseDir = getJreBaseDir(getJreDownloadDir());
    return path.join(baseDir, ...getExePath());
}

function getExePath(): string[] {
    return os.platform() === 'win32' ? ['bin', 'java.exe'] : ['bin', 'java'];
}

const getJreDownloadDir = () => path.join(getDistDir(), 'jre');

export const getJavaGenLibPath = () => path.join(getDistDir(), 'lib', 'plexusgen.jar');