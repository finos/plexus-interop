
import { spawn } from 'child_process';

export function simpleSpawn(execPath: string, args: string[] = [], printOutput: boolean = false): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const child = spawn(execPath, args);
        child.stdout.on('data', data => {
            if (printOutput) {
                console.log(`${data}`);
            }
        });
        child.stderr.on('data', (data) => {
            if (printOutput) {
                console.error(`${data}`);
            }
        });
        child.on('exit', (code, signal) => {
            if (code !== 0) {
                reject(new Error(`Child process completed with error code: ${code}`));
            } else {
                resolve();
            }
        });
        child.on('error', error => {
            reject(error);
        });
    });
}