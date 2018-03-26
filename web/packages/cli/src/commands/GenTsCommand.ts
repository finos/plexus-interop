import * as path from 'path';
import { BaseCommand } from './BaseCommand';
import { getJavaExecPath } from '../common/java';
import { spawn } from 'child_process';

export class GenTsCommand extends BaseCommand {

    public name = () => 'gen-ts';

    public options = () => [
        {
            flags: '-b, --baseDir <baseDir>',
            description: 'plexus metadata base directory',
            defaultValue: process.cwd()
        },
        {
            flags: '-i, --input <input>',
            description: 'file containing Plexus Component\'s entry point, e.g. RateProvider.interop'
        },
        {
            flags: '-o, --out <out>',
            description: 'output directory',
            defaultValue: `${process.cwd()}${path.sep}gen`
        },
        {
            flags: '-n, --namespace <namespace>',
            description: 'generated message dtos namespace',
            defaultValue: `plexus`
        }
    ]

    public async action(opts: any): Promise<void> {
        // const namespace = opts.namespace;
        // const out = opts.out;
        // const input = opts.input;
        // const baseDir = opts.baseDir;
        // const jsDtoOut = path.join(out, 'plexus-messages.js');
        const javaExecPath = await getJavaExecPath();
        return new Promise<void>((resolve, reject) => {
            console.log(`Executing ${javaExecPath}`);
            const javaProcess = spawn(javaExecPath, ['-version']);
            javaProcess.stdout.on('data', data => {
                console.log(`${data}`);
            });
            javaProcess.stderr.on('data', (data) => {
                console.error(`${data}`);
            });
            javaProcess.on('exit', (code, signal) => {
                console.log(`completed ${code} ${signal}`);
                if (code !== 0) {
                    reject(new Error(`Child process completed with error code: ${code}`));
                } else {
                    resolve();
                }
            });
            javaProcess.on('error', error => {
                reject(error);
            });
        });
    }

    // public pbJsArgs(namespace: string, out: string): string[] {
    //     const jsDtoOut = path.join(out, 'plexus-messages.js');
    //     return ['--force-long',
    //         '-t', 'static-module',
    //         '-r', namespace,
    //         '-w', 'commonjs',
    //         '-o', jsDtoOut];
    // }

    public usageExamples = () => ` $ plexus ${this.name()} -b ./metadata -i RateProvider.interop -o ./src/gen`;

}
