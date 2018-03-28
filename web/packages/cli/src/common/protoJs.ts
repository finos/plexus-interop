
import { pbjs, pbts } from 'protobufjs/cli';

export function genJsStaticModule(outFilePath: string, protoFiles: string[], namespace: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        pbjs.main(['--force-long', '-t', 'static-module', '-r', namespace, '-w', 'commonjs', '-o', outFilePath, ...protoFiles], (error, output) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
            return {};
        });
    });
}

export function genTsStaticModule(outFilePath: string, jsGeneratedFilePath: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        pbts.main(['--force-long', '-o', outFilePath, jsGeneratedFilePath], (error, output) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
            return {};
        });
    });
}

