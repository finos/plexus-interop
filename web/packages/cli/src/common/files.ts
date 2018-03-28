
import * as fs from 'fs';
import * as path from 'path';
import * as rmdir from 'rmdir';
import * as mrkdirp from 'mkdirp';

export function getDirectories(dirPath: string): string[] {
    return fs.readdirSync(dirPath).filter(
        file => fs.statSync(path.join(dirPath, file)).isDirectory()
    );
}

export function deleteDirectory(dir: string): void {
    rmdir(dir);
}

export function mkdirsSync(dir: string): void {
    mrkdirp.sync(dir);
}

export function createIfNotExistSync(dir: string): void {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}

export async function listFiles(baseDir: string, pattern: RegExp): Promise<string[]> {
    const result: string[] = [];
    iterateFiles(baseDir, pattern, f => result.push(f));
    return result;
}

function iterateFiles(baseDir: string, pattern: RegExp, callback: (file: string) => void): void {
    if (!fs.existsSync(baseDir)) {
        return;
    }
    const files = fs.readdirSync(baseDir);
    files.forEach(f => {
        const fileName = path.join(baseDir, f);
        if (fs.lstatSync(fileName).isDirectory()) {
            iterateFiles(fileName, pattern, callback);
        } else if (pattern.test(fileName)) {
            callback(fileName);
        }
    });
}