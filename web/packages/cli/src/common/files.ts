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
import * as fs from 'fs-extra';
import * as path from 'path';
import * as AdmZip from 'adm-zip';

export function getDistDir(): string {
    return path.resolve(getBaseDir(), 'dist');
}

export function getBaseDir(): string {
    return path.join(__dirname, '..', '..', '..', '..');
}

export function getDirectories(dirPath: string): string[] {
    return fs.readdirSync(dirPath).filter(
        file => fs.statSync(path.join(dirPath, file)).isDirectory()
    );
}

export function removeSync(file: string): void {
    fs.removeSync(file);
}

export function mkdirsSync(dir: string): void {
    fs.mkdirsSync(dir);
}

export function existsSync(path: string): boolean {
    return fs.existsSync(path);
}

export function exists(path: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        fs.exists(path, exists => {
            resolve(exists);
        });
    });
}

export async function listFiles(baseDir: string, pattern: RegExp): Promise<string[]> {
    const result: string[] = [];
    iterateFiles(baseDir, pattern, f => result.push(f));
    return result;
}

export function readTextFile(filePath: string): Promise<string> {
    return fs.readFile(filePath, 'utf8');
}

export function iterateFiles(baseDir: string, pattern: RegExp, callback: (file: string) => void, recursive: boolean = true): void {
    if (!fs.existsSync(baseDir)) {
        return;
    }
    const files = fs.readdirSync(baseDir);
    files.forEach(f => {
        const fileName = path.join(baseDir, f);
        if (isDirectory(fileName, false)) {
            iterateFiles(fileName, pattern, callback);
        } else if (pattern.test(fileName)) {
            callback(fileName);
        }
    });
}

export function unzipSync(zipPath: string, dir: string, removeZip: boolean = true): void {
    console.log(`Extracting ${zipPath} to ${dir}`);
    const zipArchive = new AdmZip(zipPath);
    zipArchive.extractAllTo(dir, true);
    console.log(`Extracted zip to ${dir}`);
    if (removeZip) {
        console.log(`Clearing zip ${zipPath}`);
        removeSync(zipPath);
    }
}

function isDirectory(path: string, failOnPermissonError: boolean = true): boolean {
    try {
        return fs.lstatSync(path).isDirectory();
    } catch (error) {
        if (!failOnPermissonError && error.code === 'EPERM') {
            return false;
        } else {
            throw error;
        }
    }
}

export function copyFile(source: string, target: string): Promise<void> {
    return fs.copy(source, target);
}