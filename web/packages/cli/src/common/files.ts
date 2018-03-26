
import * as fs from 'fs';
import * as path from 'path';
import * as rmdir from 'rmdir';

export function getDirectories(dirPath: string): string[] {
    return fs.readdirSync(dirPath).filter(
        file => fs.statSync(path.join(dirPath, file)).isDirectory()
    );
}

export function deleteDirectory(dir: string): void {
    rmdir(dir);
}

export function createIfNotExistSync(dir: string): void {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}