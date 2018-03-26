import * as path from 'path';
import { BaseJavaGenCommand } from 'src/commands/BaseJavaGenCommand';

export class GenTsCommand extends BaseJavaGenCommand {
    
    public plexusGenArgs: (opts: any) => string[] = opts => {
        return ['--type=ts'];
    }

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

    public usageExamples = () => ` $ plexus ${this.name()} -b ./metadata -i RateProvider.interop -o ./src/gen`;

}
