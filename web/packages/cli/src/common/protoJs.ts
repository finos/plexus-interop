
import { pbjs, pbts } from 'protobufjs/cli';

export function genJsStaticModule(outFilePath: string, protoFiles: string[], namespace: string, verbose: boolean = false): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        pbjs.main(['--force-long', '-t', 'static-module', '-w', 'commonjs', '-o', outFilePath, ...protoFiles], (error, output) => {
            if (verbose) {
                console.log(output);
            }
            return {};
        });
    });
}

export function genTsStaticModule(outFilePath: string, jsGeneratedFilePath: string, verbose: boolean = false): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        pbts.main(['--force-long', '-o', outFilePath, jsGeneratedFilePath]);
    });
}

