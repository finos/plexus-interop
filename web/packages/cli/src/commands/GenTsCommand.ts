import * as path from 'path';
import { BaseCommand } from './BaseCommand';
import { getJavaExecPath } from '../common/java';
import { simpleSpawn } from '../common/process';

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
        return simpleSpawn(javaExecPath, ['-version']);
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
