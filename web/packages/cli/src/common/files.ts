
import * as fs from 'fs';
import * as path from 'path';

export const getDirectories = (dirPath: string) =>  {
    return fs.readdirSync(dirPath).filter(
        file => fs.statSync(path.join(dirPath, file)).isDirectory()
    );
};